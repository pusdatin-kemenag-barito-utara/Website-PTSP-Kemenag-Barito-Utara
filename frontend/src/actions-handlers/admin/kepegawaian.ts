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

export async function getLaporanKinerjaAction(_dateFilter?: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Belum login." };

    // TODO: Fetch laporan kinerja dari backend saat fitur LKH/Laporan Kinerja Pegawai diaktifkan.
    return { data: [], isPemimpin: false };
  } catch (err: any) {
    console.error("Gagal fetch laporan:", err);
    return { error: err.message || "Terjadi kesalahan." };
  }
}

export async function updateLaporanStatusAction(
  _id: string,
  _status: string,
  _komentar?: string,
) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Belum login." };

    revalidatePath("/admin/kepegawaian/laporan");
    return { success: true };
  } catch (err: any) {
    console.error("Gagal update status:", err);
    return { error: err.message || "Terjadi kesalahan." };
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
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Gagal membuat data pegawai." };
  }
}

export async function updatePegawaiAction(
  id: string,
  data: {
    fullName: string;
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
        jabatan: data.jabatan,
        unitKerja: data.unitKerja,
        golongan: "",
        jenisPegawai: "PNS",
      }),
    });

    revalidatePath("/admin/kepegawaian/pegawai");
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
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Gagal menghapus data pegawai." };
  }
}
