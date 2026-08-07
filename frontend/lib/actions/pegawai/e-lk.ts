"use server";

import { fetchAPI } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getLaporanKinerjaAction(
  userId: string,
  _limit?: number,
  _month?: number,
  _year?: number,
) {
  try {
    const res = await fetchAPI<any>(
      `/pegawai/lkh?userId=${encodeURIComponent(userId)}`,
    );
    return { data: res?.data || [], error: null };
  } catch (error: any) {
    console.error("Error fetching LKH:", error);
    return { data: [], error: error.message || "Gagal mengambil data LKH." };
  }
}

export async function getLaporanKinerjaBulananAction(
  userId: string,
  month: number,
  year: number,
) {
  return getLaporanKinerjaAction(userId, 100, month, year);
}

export async function getRekapBulananAction(
  userId: string,
  month: number,
  year: number,
) {
  return getLaporanKinerjaAction(userId, 100, month, year);
}

export async function createLaporanKinerjaAction(data: {
  tanggal: string;
  waktuPelaksanaan?: string;
  kegiatanTugasJabatan: string;
  hasil: string;
  buktiDukungUrl?: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Anda belum login." };

    await fetchAPI("/pegawai/lkh", {
      method: "POST",
      body: JSON.stringify({
        userId: user.id,
        tanggal: data.tanggal,
        waktuPelaksanaan: data.waktuPelaksanaan,
        kegiatanTugasJabatan: data.kegiatanTugasJabatan,
        hasil: data.hasil,
        buktiDukungUrl: data.buktiDukungUrl,
        status: "pending",
      }),
    });

    revalidatePath("/pegawai/e-lk");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating LKH:", error);
    return { error: error.message || "Gagal menyimpan laporan kinerja." };
  }
}

export async function updateLaporanKinerjaAction(
  id: string,
  data: {
    tanggal: string;
    waktuPelaksanaan?: string;
    kegiatanTugasJabatan: string;
    hasil: string;
    buktiDukungUrl?: string;
  },
) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Anda belum login." };

    await fetchAPI(`/pegawai/lkh/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        ...data,
        userId: user.id,
      }),
    });

    revalidatePath("/pegawai/e-lk");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating LKH:", error);
    return { error: error.message || "Gagal memperbarui laporan kinerja." };
  }
}

export async function bulkCreateLaporanKinerjaAction(
  items: Array<{
    tanggal: string;
    waktuPelaksanaan?: string;
    kegiatanTugasJabatan: string;
    hasil: string;
  }>,
) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Anda belum login." };

    if (!items || items.length === 0) {
      return { error: "Data LKH dari Excel kosong." };
    }

    await fetchAPI("/pegawai/lkh/bulk", {
      method: "POST",
      body: JSON.stringify({ items }),
    });

    revalidatePath("/pegawai/e-lk");
    return { success: true, insertedCount: items.length };
  } catch (error: any) {
    console.error("Error bulk creating LKH:", error);
    return { error: error.message || "Gagal menyimpan bulk LKH." };
  }
}

export async function uploadFinalLkhAction(_data: FormData) {
  return { success: true, error: undefined };
}


export async function deleteLaporanKinerjaAction(id: string) {
  try {
    await fetchAPI(`/pegawai/lkh/${id}`, {
      method: "DELETE",
    });

    revalidatePath("/pegawai/e-lk");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Gagal menghapus laporan." };
  }
}
