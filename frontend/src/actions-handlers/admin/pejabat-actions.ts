import { fetchAPI } from "@/lib/api";
import { revalidatePath } from "@/lib/next-compat/cache";

import { createAdminClient } from "@/lib/supabase/admin";

export async function getPejabatList() {
  try {
    const supabase = createAdminClient();
    
    // Ambil data pejabat langsung dari schema kemenag_ptsp
    const { data: pegawai, error: errPegawai } = await (supabase as any)
      .schema("kemenag_ptsp")
      .from("profiles_pegawai")
      .select("id, nip, nama, jabatan, unit_kerja, tipe_pejabat, order_index")
      .not("tipe_pejabat", "is", null)
      .order("order_index", { ascending: true });

    if (errPegawai || !pegawai) {
      throw errPegawai || new Error("Gagal mengambil data profiles_pegawai");
    }

    const rawData = pegawai.map((u: any) => ({
      id: u.id,
      nip: u.nip,
      nama: u.nama || "Pegawai Kemenag",
      jabatan: u.jabatan || "",
      unitKerja: u.unit_kerja || "",
      tipePejabat: u.tipe_pejabat || "",
    }));

    return { success: true, data: rawData };
  } catch (error) {
    console.error("Error getPejabatList:", error);
    return { success: false, error: "Gagal mengambil data pejabat dari database." };
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
