"use server";

import { db } from "@/lib/db";
import { profiles, profilesPemohon } from "@/lib/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { requireAuth, requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

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

    // Cek apakah nomor sudah digunakan oleh pemohon lain
    const existingUser = await db.query.profiles.findFirst({
      where: and(
        eq(profiles.phone, cleanPhone),
        eq(profiles.role, "user"),
        ne(profiles.id, profile.id)
      ),
    });

    if (existingUser) {
      return { error: "Nomor WhatsApp ini sudah digunakan oleh pemohon lain." };
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
    const errString = String(err) + String(err.cause);
    if (
      errString.includes("ptsp_profiles_phone_unique") ||
      errString.includes("ptsp_profiles_phone_key") ||
      err.code === "23505" ||
      err.cause?.code === "23505" ||
      errString.includes("unique constraint")
    ) {
      return { error: "Nomor WhatsApp ini sudah digunakan oleh akun lain." };
    }
    return { error: "Terjadi kesalahan saat menyimpan profil: " + err.message };
  }
}

export async function updatePegawaiPhoneAction(formData: FormData) {
  try {
    const profile = await requireAuth(true); // Allow incomplete to let them in to update

    if (!profile) {
      return { error: "Sesi tidak valid. Silakan login kembali." };
    }

    const phone = formData.get("phone") as string;

    if (!phone) {
      return { error: "Nomor WhatsApp wajib diisi." };
    }

    let cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "62" + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith("62")) {
      cleanPhone = "62" + cleanPhone;
    }

    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      return { error: "Format nomor WhatsApp tidak valid." };
    }

    // Cek apakah nomor sudah digunakan oleh pegawai lain
    const existingPegawai = await db.query.profiles.findFirst({
      where: and(
        eq(profiles.phone, cleanPhone),
        ne(profiles.role, "user"),
        ne(profiles.id, profile.id)
      ),
    });

    if (existingPegawai) {
      return { error: "Nomor WhatsApp ini sudah digunakan oleh pegawai lain." };
    }

    await db
      .update(profiles)
      .set({
        phone: cleanPhone,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, profile.id));

    revalidatePath("/pegawai/profil");

    return { success: true };
  } catch (err: any) {
    console.error("Update pegawai phone error:", err);
    const errString = String(err) + String(err.cause);
    if (
      errString.includes("ptsp_profiles_phone_unique") ||
      errString.includes("ptsp_profiles_phone_key") ||
      err.code === "23505" ||
      err.cause?.code === "23505" ||
      errString.includes("unique constraint")
    ) {
      return { error: "Nomor WhatsApp ini sudah digunakan oleh akun lain." };
    }
    return { error: "Terjadi kesalahan saat menyimpan nomor WA: " + err.message };
  }
}

export async function updatePemohonWhatsappAction(formData: FormData) {
  try {
    const profile = await requireAuth(true); // Allow incomplete

    if (!profile) {
      return { error: "Sesi tidak valid. Silakan login kembali." };
    }

    const phone = formData.get("phone") as string;
    const nik = formData.get("nik") as string;
    const pekerjaan = formData.get("pekerjaan") as string;
    const alamat = formData.get("alamat") as string;

    if (!phone) {
      return { error: "Nomor WhatsApp wajib diisi." };
    }

    let cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "62" + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith("62")) {
      cleanPhone = "62" + cleanPhone;
    }

    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      return { error: "Format nomor WhatsApp tidak valid." };
    }

    // Cek apakah nomor sudah digunakan
    const existingPemohon = await db.query.profilesPemohon.findFirst({
      where: and(
        eq(profilesPemohon.noHp, cleanPhone),
        ne(profilesPemohon.profileId, profile.id)
      ),
    });

    if (existingPemohon) {
      return { error: "Nomor WhatsApp ini sudah digunakan oleh pemohon lain." };
    }

    // Upsert to profilesPemohon
    await db
      .insert(profilesPemohon)
      .values({
        profileId: profile.id,
        noHp: cleanPhone,
        nik: nik || null,
        pekerjaan: pekerjaan || null,
        alamat: alamat || null,
        fullName: profile.fullName || null,
      })
      .onConflictDoUpdate({
        target: profilesPemohon.profileId,
        set: {
          noHp: cleanPhone,
          nik: nik || null,
          pekerjaan: pekerjaan || null,
          alamat: alamat || null,
          fullName: profile.fullName || null,
          updatedAt: new Date(),
        },
      });

    // Update profiles as well for backward compatibility
    await db
      .update(profiles)
      .set({
        phone: cleanPhone,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, profile.id));

    revalidatePath("/dashboard");

    return { success: true };
  } catch (err: any) {
    console.error("Update pemohon whatsapp error:", err);
    const errString = String(err) + String(err.cause);
    if (
      errString.includes("profiles_pemohon_no_hp_unique") ||
      errString.includes("profiles_pemohon_nik_unique") ||
      err.code === "23505" ||
      err.cause?.code === "23505" ||
      errString.includes("unique constraint")
    ) {
      return { error: "Nomor WhatsApp atau NIK ini sudah digunakan oleh akun lain." };
    }
    return { error: "Terjadi kesalahan saat menyimpan data: " + err.message };
  }
}
