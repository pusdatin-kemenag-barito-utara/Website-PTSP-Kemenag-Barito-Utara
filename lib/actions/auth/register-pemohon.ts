"use server";

import { z } from "zod";
import { AuthService } from "@/lib/services/auth-service";
import { verifyTurnstileAction } from "@/lib/actions/auth/login-helper";

export type ActionResult = {
  success: boolean;
  message?: string;
  error?: string;
};

import { db } from "@/lib/db";
import { authOtps, whatsappOutbox, profiles } from "@/lib/db/schema";
import { eq, and, desc, gt } from "drizzle-orm";
import { stripHtml } from "@/lib/utils";

const RegisterSchema = z.object({
  fullName: z.string().min(3, "Nama minimal 3 karakter"),
  phone: z.string().min(10, "Nomor WhatsApp tidak valid"),
  address: z.string().min(5, "Alamat minimal 5 karakter"),
  password: z.string()
    .min(8, "Password minimal 8 karakter")
    .regex(/[A-Za-z]/, "Password harus mengandung huruf")
    .regex(/[0-9]/, "Password harus mengandung angka"),
});

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function requestRegistrationOtpAction(phone: string, token: string) {
  if (!phone) return { error: "Nomor WhatsApp wajib diisi." };

  const verifyRes = await verifyTurnstileAction(token);
  if (!verifyRes.success) {
    return { error: "Verifikasi keamanan gagal. Silakan coba lagi." };
  }

  const existingProfile = await db.query.profiles.findFirst({
    where: eq(profiles.phone, phone),
    columns: { id: true },
  });

  if (existingProfile) {
    return { error: "Nomor WhatsApp ini sudah terdaftar." };
  }

  const otpCode = generateOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  try {
    await db.insert(authOtps).values({
      phone,
      otp: otpCode,
      expiresAt,
    });

    const waMessage = `*KODE OTP PENDAFTARAN PTSP*\n\nKode OTP Anda adalah:\n*${otpCode}*\n\nKode ini berlaku selama 5 menit. Jangan berikan kode ini kepada siapapun.`;
    
    await db.insert(whatsappOutbox).values({
      phone,
      message: waMessage,
      status: 'pending',
    });

    return { success: true };
  } catch (err: any) {
    return { error: "Gagal membuat OTP. Silakan coba lagi nanti." };
  }
}

export async function registerPemohonAction(formData: FormData, otp?: string): Promise<ActionResult> {
  try {
    if (!otp) {
       return { success: false, error: "Kode OTP wajib diisi." };
    }

    const turnstileToken = String(formData.get("turnstile_token") || "");
    const verifyRes = await verifyTurnstileAction(turnstileToken);
    if (!verifyRes.success) {
      return { success: false, error: "Verifikasi keamanan gagal. Silakan coba lagi." };
    }

    const rawPhone = String(formData.get("phone") || "");
    
    // Verify OTP first
    const latestOtp = await db.query.authOtps.findFirst({
      where: and(
        eq(authOtps.phone, rawPhone),
        eq(authOtps.isUsed, false),
        gt(authOtps.expiresAt, new Date())
      ),
      orderBy: [desc(authOtps.createdAt)],
    });

    if (!latestOtp || latestOtp.otp !== otp) {
      return { success: false, error: "Kode OTP tidak valid atau sudah kedaluwarsa." };
    }

    const validated = RegisterSchema.safeParse({
      fullName: stripHtml(String(formData.get("full_name") || "")),
      phone: rawPhone,
      address: stripHtml(String(formData.get("address") || "")),
      password: formData.get("password"),
    });

    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    // Mark OTP as used safely
    const updateRes = await db.update(authOtps)
      .set({ isUsed: true })
      .where(and(eq(authOtps.id, latestOtp.id), eq(authOtps.isUsed, false)))
      .returning({ id: authOtps.id });

    if (updateRes.length === 0) {
       return { success: false, error: "Kode OTP sudah digunakan." };
    }

    await AuthService.registerPemohon(validated.data);

    return { success: true, message: "Pendaftaran berhasil. Silakan login." };
  } catch (error: any) {
    console.error("Registration error:", error);
    return { success: false, error: error.message || "Gagal melakukan pendaftaran" };
  }
}
