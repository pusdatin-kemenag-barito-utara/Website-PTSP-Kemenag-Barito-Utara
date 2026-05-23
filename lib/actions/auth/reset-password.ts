"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyTurnstileAction } from "@/lib/actions/auth/login-helper";
import crypto from "crypto";

const JWT_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || "fallback_secret_for_reset";

function generateResetToken(phone: string): string {
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes expiry
  const data = `${phone}:${expiresAt}`;
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(data).digest("hex");
  return `${phone}:${expiresAt}:${signature}`;
}

function verifyResetToken(phone: string, token: string): boolean {
  try {
    const [tokenPhone, expiresAtStr, signature] = token.split(":");
    if (tokenPhone !== phone) return false;
    
    const expiresAt = Number(expiresAtStr);
    if (Date.now() > expiresAt) return false; // Expired
    
    const data = `${phone}:${expiresAt}`;
    const expectedSignature = crypto.createHmac("sha256", JWT_SECRET).update(data).digest("hex");
    return signature === expectedSignature;
  } catch (e) {
    return false;
  }
}

export async function checkPhoneExistsAction(phone: string, token: string) {
  if (!phone) return { error: "Nomor HP wajib diisi." };

  const verifyRes = await verifyTurnstileAction(token);
  if (!verifyRes.success) {
    return { error: "Verifikasi keamanan gagal. Silakan coba lagi." };
  }

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.phone, phone),
    columns: { id: true },
  });

  if (!profile) {
    return { exists: false };
  }
  
  const resetToken = generateResetToken(phone);
  return { exists: true, resetToken };
}

export async function checkEmailExistsAction(email: string, token: string) {
  if (!email) return { error: "Email wajib diisi." };

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

    // 3. Update plain_password di tabel profiles agar tetap sinkron untuk Super Admin
    await db
      .update(profiles)
      .set({ plainPassword: newPassword })
      .where(eq(profiles.id, profile.id));

    return { success: true, name: profile.fullName };
  } catch (err: any) {
    return { error: "Terjadi kesalahan internal: " + err.message };
  }
}
