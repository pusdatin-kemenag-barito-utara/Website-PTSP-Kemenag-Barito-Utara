"use server";

import { fetchAPI } from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function getPejabatList() {
  try {
    const res = await fetchAPI<any>("/admin/cuti/pegawai");
    if (res && res.data && Array.isArray(res.data)) {
      const rawData = res.data.filter(
        (u: any) =>
          u.jenisPegawai === "Pejabat" ||
          u.jenis_pegawai === "Pejabat" ||
          ["Atasan Langsung", "Kepala Kantor", "Pejabat Berwenang"].includes(
            u.tipePejabat || u.tipe_pejabat || u.jabatan,
          ),
      );
      return { success: true, data: rawData };
    }
    return { success: true, data: [] };
  } catch (error) {
    console.error("Error getPejabatList:", error);
    return { success: false, error: "Gagal mengambil data pejabat." };
  }
}

export async function upsertPejabat(data: {
  id?: string;
  tipePejabat: string;
  unitKerja: string | null;
  nama: string;
  nip: string;
  jabatan: string | null;
}) {
  try {
    if (data.id) {
      await fetchAPI(`/admin/cuti/pegawai/${data.id}`, {
        method: "PUT",
        body: JSON.stringify({
          nama: data.nama,
          jabatan: data.jabatan || data.tipePejabat,
          unitKerja: data.unitKerja || "",
          golongan: "",
          jenisPegawai: "Pejabat",
        }),
      });
    } else {
      await fetchAPI("/admin/cuti/pegawai", {
        method: "POST",
        body: JSON.stringify({
          nama: data.nama,
          nip: data.nip,
          jabatan: data.jabatan || data.tipePejabat,
          unitKerja: data.unitKerja || "",
          golongan: "",
          jenisPegawai: "Pejabat",
        }),
      });
    }

    revalidatePath("/admin/manajemen-pegawai/pejabat");
    revalidatePath("/pegawai/cuti/tambah");
    return { success: true };
  } catch (error: any) {
    console.error("Error upsertPejabat:", error);
    return {
      success: false,
      error: error.message || "Gagal menyimpan data pejabat.",
    };
  }
}

export async function deletePejabat(id: string) {
  try {
    await fetchAPI(`/admin/cuti/pegawai/${id}`, {
      method: "DELETE",
    });
    revalidatePath("/admin/manajemen-pegawai/pejabat");
    return { success: true };
  } catch (error: any) {
    console.error("Error deletePejabat:", error);
    return {
      success: false,
      error: error.message || "Gagal menghapus data pejabat.",
    };
  }
}

export async function reorderPejabat(
  _items: { id: string; orderIndex: number }[],
) {
  try {
    revalidatePath("/admin/manajemen-pegawai/pejabat");
    revalidatePath("/pegawai/cuti/tambah");
    return { success: true };
  } catch (error: any) {
    console.error("Error reorderPejabat:", error);
    return {
      success: false,
      error: error.message || "Gagal menyimpan urutan baru.",
    };
  }
}
