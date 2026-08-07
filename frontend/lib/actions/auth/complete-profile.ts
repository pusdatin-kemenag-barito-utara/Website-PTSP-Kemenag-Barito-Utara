"use server";

import { requireAuth } from "@/lib/auth";
import { fetchAPI } from "@/lib/api";

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

    let cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "62" + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith("62")) {
      cleanPhone = "62" + cleanPhone;
    }

    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      return { error: "Format nomor WhatsApp tidak valid." };
    }

    await fetchAPI(`/admin/profile/${profile.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        full_name: fullName,
        avatar_url: profile.avatarUrl || undefined,
      }),
    });

    return { success: true };
  } catch (err: any) {
    console.error("Complete profile error:", err);
    return { error: "Terjadi kesalahan saat menyimpan profil: " + err.message };
  }
}

export async function updatePegawaiPhoneAction(formData: FormData) {
  try {
    const profile = await requireAuth(true);

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

    await fetchAPI(`/admin/profile/${profile.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        full_name: profile.name,
      }),
    });

    return { success: true };
  } catch (err: any) {
    console.error("Update pegawai phone error:", err);
    return { error: err.message || "Gagal memperbarui nomor telepon" };
  }
}

export async function updatePemohonWhatsappAction(formData: FormData) {
  return completeProfileAction(formData);
}
