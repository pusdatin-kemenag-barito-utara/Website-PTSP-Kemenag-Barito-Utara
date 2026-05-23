"use server";

import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";
import { verifyTurnstileToken } from "@/lib/turnstile";

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

export async function verifyTurnstileAction(token: string) {
  if (!token)
    return { success: false, error: "Token keamanan tidak ditemukan." };

  try {
    const success = await verifyTurnstileToken(token);
    return { success };
  } catch (err) {
    console.error("Turnstile verify error:", err);
    return { success: false, error: "Gagal memverifikasi keamanan." };
  }
}

