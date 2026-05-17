"use server";

import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";

export async function getEmailByPhoneAction(phone: string) {
  if (!phone) throw new Error("Nomor WhatsApp wajib diisi.");

  const digits = phone.replace(/\D/g, "");
  const formats = [digits, `0${digits}`, `62${digits}`];

  const profile = await db.query.profiles.findFirst({
    where: or(...formats.map((f) => eq(profiles.phone, f))),
    columns: { email: true },
  });

  if (!profile) {
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
