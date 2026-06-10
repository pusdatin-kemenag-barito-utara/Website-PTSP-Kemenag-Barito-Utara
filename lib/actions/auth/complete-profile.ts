"use server";

import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export async function completeProfileAction(formData: FormData) {
  try {
    const profile = await requireAuth(true); // Allow incomplete here

    if (!profile) {
      return { error: "Sesi tidak valid. Silakan login kembali." };
    }

    const fullName = formData.get("fullName") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;

    if (!fullName || !phone || !address) {
      return { error: "Semua kolom (Nama, WhatsApp, Alamat) wajib diisi." };
    }

    // Clean phone number (remove non-digits, ensure starts with 0 or 62)
    let cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "62" + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith("62")) {
      cleanPhone = "62" + cleanPhone;
    }

    // Validate length roughly
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      return { error: "Format nomor WhatsApp tidak valid." };
    }

    await db
      .update(profiles)
      .set({
        fullName,
        phone: cleanPhone,
        address,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, profile.id));

    return { success: true };
  } catch (err: any) {
    console.error("Complete profile error:", err);
    if (err.message?.includes("ptsp_profiles_phone_key") || err.message?.includes("unique constraint")) {
      return { error: "Nomor WhatsApp ini sudah digunakan oleh akun lain." };
    }
    return { error: "Terjadi kesalahan saat menyimpan profil: " + err.message };
  }
}
