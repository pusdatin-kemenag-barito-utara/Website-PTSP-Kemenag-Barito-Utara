import { getCurrentUser } from "@/lib/auth";
import { fetchAPI } from "@/lib/api";
import { revalidatePath } from "@/lib/next-compat/cache";

export async function submitLaporanKinerjaAction(data: {
  tanggal: string;
  kegiatanTugasJabatan: string;
  hasil: string;
  buktiDukungUrl?: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Belum login." };

    // TODO: Integrasi dengan endpoint submit laporan kinerja jika tabel laporan kinerja pegawai sudah dibuat di backend.
    revalidatePath("/admin/kepegawaian/laporan");
    return { success: true };
  } catch (err: any) {
    console.error("Gagal submit laporan:", err);
    return { error: err.message || "Terjadi kesalahan." };
  }
}

export async function getLaporanKinerjaAction(params?: {
  search?: string;
  unitKerja?: string;
  status?: string;
  date?: string;
  month?: number;
  year?: number;
}) {
  try {
    let url = "/admin/laporan-kinerja";
    const q = new URLSearchParams();
    if (params?.search) q.set("search", params.search);
    if (params?.unitKerja && params.unitKerja !== "all") q.set("unitKerja", params.unitKerja);
    if (params?.status && params.status !== "all") q.set("status", params.status);
    if (params?.date) q.set("date", params.date);
    if (params?.month) q.set("month", params.month.toString());
    if (params?.year) q.set("year", params.year.toString());

    const queryStr = q.toString();
    if (queryStr) url += `?${queryStr}`;

    const res = await fetchAPI<{ success: boolean; data: any[] }>(url);
    return { data: res?.data || [], error: null };
  } catch (err: any) {
    console.error("Gagal fetch laporan kinerja admin:", err);
    return { data: [], error: err.message || "Terjadi kesalahan saat memuat data laporan." };
  }
}

export async function updateLaporanStatusAction(
  id: string,
  status: string,
  komentar?: string,
) {
  try {
    const res = await fetchAPI<{ success: boolean; message: string }>(`/admin/laporan-kinerja/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({
        status,
        komentarPimpinan: komentar || null,
      }),
    });

    revalidatePath("/admin/kepegawaian/laporan");
    return { success: true, message: res?.message };
  } catch (err: any) {
    console.error("Gagal update status laporan kinerja:", err);
    return { error: err.message || "Gagal memperbarui status laporan." };
  }
}

export async function deleteLaporanKinerjaAdminAction(id: string) {
  try {
    await fetchAPI(`/admin/laporan-kinerja/${id}`, {
      method: "DELETE",
    });

    revalidatePath("/admin/kepegawaian/laporan");
    return { success: true };
  } catch (err: any) {
    console.error("Gagal menghapus laporan kinerja:", err);
    return { error: err.message || "Gagal menghapus laporan kinerja." };
  }
}

export async function getPegawaiListAction() {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Belum login." };

    const res = await fetchAPI<any>("/admin/cuti/pegawai");
    if (res && res.data) {
      return { data: res.data };
    }
    return { data: [] };
  } catch (err: any) {
    return { error: "Terjadi kesalahan saat mengambil data pegawai." };
  }
}

export async function createPegawaiAction(data: {
  fullName: string;
  nip: string;
  jabatan: string;
  unitKerja: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Belum login." };

    await fetchAPI("/admin/cuti/pegawai", {
      method: "POST",
      body: JSON.stringify({
        nama: data.fullName,
        nip: data.nip,
        jabatan: data.jabatan,
        unitKerja: data.unitKerja,
        golongan: "",
        jenisPegawai: "PNS",
      }),
    });

    revalidatePath("/admin/kepegawaian/pegawai");
    revalidatePath("/admin/pengguna");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Gagal membuat data pegawai." };
  }
}

export async function updatePegawaiAction(
  id: string,
  data: {
    fullName: string;
    nip?: string;
    jabatan: string;
    unitKerja: string;
    isPejabat?: boolean;
    tipePejabat?: string;
  },
) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Belum login." };

    await fetchAPI(`/admin/cuti/pegawai/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        nama: data.fullName,
        nip: data.nip || "",
        jabatan: data.jabatan,
        unitKerja: data.unitKerja,
        golongan: "",
        jenisPegawai: "PNS",
      }),
    });

    revalidatePath("/admin/kepegawaian/pegawai");
    revalidatePath("/admin/pengguna");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Gagal memperbarui data pegawai." };
  }
}

export async function deletePegawaiAction(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Belum login." };

    await fetchAPI(`/admin/cuti/pegawai/${id}`, {
      method: "DELETE",
    });

    revalidatePath("/admin/kepegawaian/pegawai");
    revalidatePath("/admin/pengguna");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Gagal menghapus data pegawai." };
  }
}
