"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { db } from "@/lib/db";
import { profiles, authOtps, whatsappOutbox } from "@/lib/db/schema";
import { eq, and, desc, gt } from "drizzle-orm";
import { verifyTurnstileAction } from "@/lib/actions/auth/login-helper";
import crypto from "crypto";
import { headers } from "next/headers";

import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limiter";

const JWT_SECRET = process.env.PASSWORD_RESET_SECRET;

if (!JWT_SECRET) {
  throw new Error("PASSWORD_RESET_SECRET environment variable is required");
}

const JWT_SECRET_BUF: crypto.BinaryLike = JWT_SECRET;

function generateResetToken(phone: string): string {
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes expiry
  const data = `${phone}:${expiresAt}`;
  const signature = crypto.createHmac("sha256", JWT_SECRET_BUF).update(data).digest("hex");
  return `${phone}:${expiresAt}:${signature}`;
}

function verifyResetToken(phone: string, token: string): boolean {
  try {
    const [tokenPhone, expiresAtStr, signature] = token.split(":");
    if (tokenPhone !== phone) return false;
    
    const expiresAt = Number(expiresAtStr);
    if (Date.now() > expiresAt) return false; // Expired
    
    const data = `${phone}:${expiresAt}`;
    const expectedSignature = crypto.createHmac("sha256", JWT_SECRET_BUF).update(data).digest("hex");
    return signature === expectedSignature;
  } catch (e) {
    return false;
  }
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function checkPhoneExistsAction(phone: string, token: string) {
  if (!phone) return { error: "Nomor HP wajib diisi." };

  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  const { allowed: ipAllowed } = checkRateLimit(ip, "otp_ip", RATE_LIMITS.FORGOT_PASSWORD);
  if (!ipAllowed) return { error: "Terlalu banyak permintaan dari IP Anda. Silakan coba lagi nanti." };

  const { allowed: phoneAllowed } = checkRateLimit(phone, "otp_phone", { window: 3600 * 1000, max: 3 }); // 3 OTP per hour
  if (!phoneAllowed) return { error: "Batas permintaan OTP harian tercapai untuk nomor ini." };

  const verifyRes = await verifyTurnstileAction(token);
  if (!verifyRes.success) {
    return { error: "Verifikasi keamanan gagal. Silakan coba lagi." };
  }

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.phone, phone),
    columns: { id: true, fullName: true },
  });

  if (!profile) {
    return { exists: false };
  }
  
  // Create OTP and save to DB
  const otpCode = generateOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  try {
    // 1. Insert OTP
    await db.insert(authOtps).values({
      phone,
      otp: otpCode,
      expiresAt,
    });

    // 2. Insert WhatsApp Message Queue
    const waMessage = `*KODE OTP PTSP KEMENAG*\n\nHalo ${profile.fullName},\n\nKode OTP Anda untuk mengatur ulang password adalah:\n*${otpCode}*\n\nKode ini berlaku selama 5 menit. JANGAN BERIKAN KODE INI KEPADA SIAPAPUN.`;
    
    await db.insert(whatsappOutbox).values({
      phone,
      message: waMessage,
      status: 'pending',
    });

    return { exists: true };
  } catch (err: any) {
    console.error("Gagal men-generate OTP:", err);
    return { error: "Gagal membuat OTP. Silakan coba lagi nanti." };
  }
}

export async function verifyOtpAction(phone: string, otp: string) {
  if (!phone || !otp || otp.length !== 6) {
    return { error: "Data tidak valid atau OTP kurang dari 6 digit." };
  }

  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  const { allowed } = checkRateLimit(ip, "otp_verify", RATE_LIMITS.FORGOT_PASSWORD);
  if (!allowed) return { error: "Terlalu banyak percobaan. Coba lagi nanti." };

  try {
    const latestOtp = await db.query.authOtps.findFirst({
      where: and(
        eq(authOtps.phone, phone),
        eq(authOtps.isUsed, false),
        gt(authOtps.expiresAt, new Date())
      ),
      orderBy: [desc(authOtps.createdAt)],
    });

    if (!latestOtp) {
      return { error: "Kode OTP tidak valid atau sudah kedaluwarsa." };
    }

    if (latestOtp.otp !== otp) {
      return { error: "Kode OTP salah." };
    }

    // Mark as used safely with condition
    const updateRes = await db.update(authOtps)
      .set({ isUsed: true })
      .where(and(eq(authOtps.id, latestOtp.id), eq(authOtps.isUsed, false)))
      .returning({ id: authOtps.id });

    if (updateRes.length === 0) {
       return { error: "Kode OTP sudah digunakan oleh permintaan lain." };
    }

    const resetToken = generateResetToken(phone);
    return { success: true, resetToken };
  } catch (err: any) {
    console.error("Gagal verifikasi OTP:", err);
    return { error: "Terjadi kesalahan internal saat verifikasi OTP." };
  }
}

export async function checkEmailExistsAction(email: string, token: string) {
  if (!email) return { error: "Email wajib diisi." };

  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  const { allowed } = checkRateLimit(ip, "otp_email_check", RATE_LIMITS.FORGOT_PASSWORD);
  if (!allowed) return { error: "Terlalu banyak permintaan. Silakan coba lagi nanti." };

  const verifyRes = await verifyTurnstileAction(token);
  if (!verifyRes.success) {
    return { error: "Verifikasi keamanan gagal. Silakan coba lagi." };
  }

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.email, email),
    columns: { id: true, role: true },
  });

  if (!profile) {
    return { error: "Email tidak terdaftar sebagai petugas." };
  }

  if (profile.role === "user") {
    return { error: "Email ini terdaftar sebagai Pemohon. Silakan hubungi admin atau gunakan Lupa Password Pemohon." };
  }

  return { success: true };
}

export async function resetPasswordByPhoneAction(
  phone: string,
  newPassword: string,
  resetToken: string,
) {
  if (!phone || !newPassword || !resetToken) {
    return { error: "Data tidak lengkap atau token tidak valid." };
  }

  if (newPassword.length < 6) {
    return { error: "Password minimal 6 karakter." };
  }

  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  const { allowed } = checkRateLimit(ip, "reset_pwd", RATE_LIMITS.FORGOT_PASSWORD);
  if (!allowed) return { error: "Terlalu banyak permintaan. Silakan coba lagi nanti." };

  // Verify cryptographic reset token
  if (!verifyResetToken(phone, resetToken)) {
    return { error: "Sesi verifikasi Anda telah kedaluwarsa atau tidak valid. Silakan ulangi dari langkah pertama." };
  }

  const admin = createAdminClient();

  // 1. Cari user berdasarkan nomor HP di tabel profiles
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.phone, phone),
    columns: { id: true, fullName: true, email: true },
  });

  if (!profile) {
    return { error: "Nomor HP tidak terdaftar dalam sistem." };
  }

  try {
    // 2. Update password di sistem Auth menggunakan Admin API
    const { error: authError } = await admin.auth.admin.updateUserById(
      profile.id,
      { password: newPassword },
    );

    if (authError) {
      return {
        error:
          "Gagal memperbarui password di sistem keamanan: " + authError.message,
      };
    }

    return { success: true, name: profile.fullName };
  } catch (err: any) {
    return { error: "Terjadi kesalahan internal: " + err.message };
  }
}
