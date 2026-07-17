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
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .regex(/[A-Za-z]/, "Password harus mengandung huruf")
    .regex(/[0-9]/, "Password harus mengandung angka"),
});

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function formatPhone(phone: string): string {
  let cleanPhone = phone.replace(/\D/g, "");
  if (cleanPhone.startsWith("0")) {
    cleanPhone = "62" + cleanPhone.substring(1);
  } else if (!cleanPhone.startsWith("62")) {
    cleanPhone = "62" + cleanPhone;
  }
  return cleanPhone;
}

export async function requestRegistrationOtpAction(
  rawPhone: string,
  token: string,
) {
  if (!rawPhone) return { error: "Nomor WhatsApp wajib diisi." };

  const phone = formatPhone(rawPhone);

  const verifyRes = await verifyTurnstileAction(token);
  if (!verifyRes.success) {
    return { error: "Verifikasi keamanan gagal. Silakan coba lagi." };
  }

  const existingProfile = await db.query.profiles.findFirst({
    where: and(eq(profiles.phone, phone), eq(profiles.role, "user")),
    columns: { id: true },
  });

  if (existingProfile) {
    // Check if it's an orphaned profile (exists in DB but not in Auth)
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    const { error: authError } = await admin.auth.admin.getUserById(existingProfile.id);
    
    if (authError && (authError.message.includes("User not found") || authError.status === 404)) {
      await db.delete(profiles).where(eq(profiles.id, existingProfile.id));
    } else {
      return { error: "Nomor WhatsApp ini sudah terdaftar sebagai pemohon." };
    }
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

    const outboxRes = await db.insert(whatsappOutbox).values({
      phone,
      message: waMessage,
      status: "pending",
    }).returning({ id: whatsappOutbox.id });

    const botUrl = process.env.WA_BOT_URL;
    const botApiKey = process.env.WA_BOT_API_KEY;

    if (botUrl && botApiKey && outboxRes.length > 0) {
      try {
        const response = await fetch(`${botUrl}/api/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': botApiKey
          },
          body: JSON.stringify({
            to: phone,
            text: waMessage
          })
        });

        if (response.ok) {
          await db.update(whatsappOutbox)
            .set({ status: 'sent', sentAt: new Date() })
            .where(eq(whatsappOutbox.id, outboxRes[0].id));
        } else {
          console.error("WA Bot API returned error:", await response.text());
        }
      } catch (fetchErr) {
        console.error("Failed to call WA Bot API:", fetchErr);
      }
    }

    return { success: true };
  } catch (err: any) {
    return { error: "Gagal membuat OTP. Silakan coba lagi nanti." };
  }
}

export async function registerPemohonAction(
  formData: FormData,
  otp?: string,
): Promise<ActionResult> {
  try {
    if (!otp) {
      return { success: false, error: "Kode OTP wajib diisi." };
    }

    const turnstileToken = String(formData.get("turnstile_token") || "");
    const verifyRes = await verifyTurnstileAction(turnstileToken);
    if (!verifyRes.success) {
      return {
        success: false,
        error: "Verifikasi keamanan gagal. Silakan coba lagi.",
      };
    }

    const rawPhone = String(formData.get("phone") || "");
    const phone = formatPhone(rawPhone);

    // Verify OTP first
    const latestOtp = await db.query.authOtps.findFirst({
      where: and(
        eq(authOtps.phone, phone),
        eq(authOtps.isUsed, false),
        gt(authOtps.expiresAt, new Date()),
      ),
      orderBy: [desc(authOtps.createdAt)],
    });

    if (!latestOtp || latestOtp.otp !== otp) {
      return {
        success: false,
        error: "Kode OTP tidak valid atau sudah kedaluwarsa.",
      };
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
    const updateRes = await db
      .update(authOtps)
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
    return {
      success: false,
      error: error.message || "Gagal melakukan pendaftaran",
    };
  }
}
