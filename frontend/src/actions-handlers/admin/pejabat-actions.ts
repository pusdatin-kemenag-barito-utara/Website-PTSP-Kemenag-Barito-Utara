import { fetchAPI } from "@/lib/api";
import { revalidatePath } from "@/lib/next-compat/cache";

import { createAdminClient } from "@/lib/supabase/admin";

export async function getPejabatList() {
  try {
    const supabase = createAdminClient();
    
    // Ambil data pejabat dari schema kemenag_pusdatin
    const { data: pegawai, error: errPegawai } = await supabase
      .schema("kemenag_pusdatin")
      .from("profiles_pegawai")
      .select("nip, jabatan, unit_kerja, tipe_pejabat, user_id")
      .not("tipe_pejabat", "is", null);

    if (errPegawai || !pegawai) {
      throw errPegawai || new Error("Gagal mengambil data profiles_pegawai");
    }

    const userIds = pegawai.map((p) => p.user_id).filter(Boolean);
    let profilesMap: Record<string, string> = {};

    if (userIds.length > 0) {
      const { data: profiles, error: errProfiles } = await supabase
        .schema("kemenag_pusdatin")
        .from("profiles")
        .select("id, name")
        .in("id", userIds);

      if (!errProfiles && profiles) {
        profilesMap = profiles.reduce((acc: any, p: any) => {
          acc[p.id] = p.name;
          return acc;
        }, {});
      }
    }

    const rawData = pegawai.map((u: any) => ({
      nip: u.nip,
      nama: profilesMap[u.user_id] || "Pegawai Kemenag",
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
