"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { verifyTurnstileAction } from "@/lib/actions/auth/login-helper";
import crypto from "crypto";
import { headers } from "next/headers";
import { checkRateLimit, RATE_LIMITS } from "../../rate-limiter";
import { fetchAPI } from "@/lib/api";

const JWT_SECRET = process.env.PASSWORD_RESET_SECRET || "fallback-secret-key-ptsp-kemenag";

const JWT_SECRET_BUF: crypto.BinaryLike = JWT_SECRET;

function generateResetToken(phone: string): string {
  const expiresAt = Date.now() + 15 * 60 * 1000;
  const data = `${phone}:${expiresAt}`;
  const signature = crypto
    .createHmac("sha256", JWT_SECRET_BUF)
    .update(data)
    .digest("hex");
  return `${phone}:${expiresAt}:${signature}`;
}

function verifyResetToken(phone: string, token: string): boolean {
  try {
    const [tokenPhone, expiresAtStr, signature] = token.split(":");
    if (tokenPhone !== phone) return false;

    const expiresAt = Number(expiresAtStr);
    if (Date.now() > expiresAt) return false;

    const data = `${phone}:${expiresAt}`;
    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET_BUF)
      .update(data)
      .digest("hex");
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
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  const { allowed: ipAllowed } = checkRateLimit(
    ip,
    "otp_ip",
    RATE_LIMITS.FORGOT_PASSWORD,
  );
  if (!ipAllowed)
    return {
      error: "Terlalu banyak permintaan dari IP Anda. Silakan coba lagi nanti.",
    };

  const { allowed: phoneAllowed } = checkRateLimit(phone, "otp_phone", {
    window: 3600 * 1000,
    max: 3,
  });
  if (!phoneAllowed)
    return {
      error: "Batas permintaan OTP harian tercapai untuk nomor ini.",
    };

  const verifyRes = await verifyTurnstileAction(token);
  if (!verifyRes.success) {
    return { error: "Verifikasi keamanan gagal. Silakan coba lagi." };
  }

  try {
    const res = await fetchAPI<any>(`/admin/search?q=${encodeURIComponent(phone)}`);
    const profilesList = res?.data?.profiles || res?.profiles || [];

    if (profilesList.length === 0) {
      return { exists: false };
    }

    const profile = profilesList[0];
    const otpCode = generateOtp();

    return {
      exists: true,
      success: true,
      message: `Kode OTP dikirimkan ke ${phone}`,
      otp: otpCode,
    };
  } catch (err: any) {
    console.error("Error checkPhoneExistsAction:", err);
    return { error: "Gagal memproses reset password. Silakan coba lagi." };
  }
}

export async function checkEmailExistsAction(emailOrPhone: string, token: string) {
  return checkPhoneExistsAction(emailOrPhone, token);
}

export async function verifyPasswordResetOtpAction(phone: string, otp: string) {
  if (!phone || !otp) return { error: "Data OTP tidak lengkap." };
  const resetToken = generateResetToken(phone);
  return { success: true, token: resetToken };
}

export async function resetPasswordWithTokenAction(
  userId: string,
  newPassword: string,
  token: string,
) {
  if (!userId || !newPassword || !token) {
    return { error: "Data tidak lengkap." };
  }

  try {
    const admin = createAdminClient();
    const { error: updateErr } = await admin.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (updateErr) {
      return { error: updateErr.message };
    }

    return { success: true, message: "Password berhasil diperbarui." };
  } catch (err: any) {
    console.error("Error resetPasswordWithTokenAction:", err);
    return { error: err.message || "Gagal mereset password." };
  }
}
