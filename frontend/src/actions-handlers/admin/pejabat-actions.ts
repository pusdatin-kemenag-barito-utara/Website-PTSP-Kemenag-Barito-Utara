import { fetchAPI } from "@/lib/api";
import { revalidatePath } from "@/lib/next-compat/cache";

export async function getPejabatList() {
  try {
    const res = await fetchAPI<any>("/pegawai/pejabat");
    if (!res || !res.success) {
      throw new Error(res?.error || "Gagal mengambil data pejabat dari server");
    }

    return { success: true, data: res.data || [] };
  } catch (error: any) {
    console.error("Error getPejabatList:", error);
    return { success: false, error: error?.message || "Gagal mengambil data pejabat dari database." };
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
    const res = await fetchAPI<any>("/admin/cuti/pejabat", {
      method: "POST",
      body: JSON.stringify({
        id: data.id || "",
        nama: data.nama,
        nip: data.nip,
        jabatan: data.jabatan || data.tipePejabat,
        unitKerja: data.unitKerja || "",
        tipePejabat: data.tipePejabat,
      }),
    });

    if (!res || !res.success) {
      throw new Error(res?.error || "Gagal menyimpan data pejabat");
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
    const res = await fetchAPI<any>(`/admin/cuti/pejabat/${id}`, {
      method: "DELETE",
    });

    if (!res || !res.success) {
      throw new Error(res?.error || "Gagal menghapus data pejabat");
    }

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
  items: { id: string; orderIndex: number }[],
) {
  try {
    const res = await fetchAPI<any>("/admin/cuti/pejabat-reorder", {
      method: "PUT",
      body: JSON.stringify(items),
    });

    if (!res || !res.success) {
      throw new Error(res?.error || "Gagal menyimpan urutan baru");
    }

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

