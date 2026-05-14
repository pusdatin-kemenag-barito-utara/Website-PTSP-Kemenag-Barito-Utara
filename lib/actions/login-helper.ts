"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function getEmailByPhoneAction(phone: string) {
  if (!phone) throw new Error("Nomor WhatsApp wajib diisi.");

  const admin = createAdminClient();
  const digits = phone.replace(/\D/g, "");

  // Search by various possible formats just in case
  const { data: profile, error } = await admin
    .from("profiles")
    .select("email")
    .or(`phone.eq.${digits},phone.eq.0${digits},phone.eq.62${digits}`)
    .maybeSingle();

  if (error || !profile) {
    return {
      error: "Nomor WhatsApp tidak ditemukan. Pastikan sudah terdaftar.",
    };
  }

  return { email: profile.email };
}

export async function verifyRecaptchaAction(token: string) {
  if (!token)
    return { success: false, error: "Token reCAPTCHA tidak ditemukan." };

  try {
    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
      { method: "POST" },
    );

    const data = await response.json();
    return { success: data.success };
  } catch (err) {
    console.error("reCAPTCHA verify error:", err);
    return { success: false, error: "Gagal memverifikasi reCAPTCHA." };
  }
}
