"use server";

import { getCurrentUser } from "@/lib/auth";
import { fetchAPI } from "@/lib/api";
import { revalidatePath } from "next/cache";

type ActionResponse =
  | { success: true; message?: string; data?: unknown; count?: number }
  | { success: false; error: string };

export async function getDataCutiListAction(
  search?: string,
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Belum login." };

    let url = "/admin/cuti/pegawai";
    if (search) {
      url += `?search=${encodeURIComponent(search)}`;
    }
    const res = await fetchAPI<any>(url);
    if (res && res.data) {
      return { success: true, data: res.data };
    }
    return { success: true, data: [] };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Gagal mengambil data cuti.",
    };
  }
}

export async function getDataCutiByIdAction(
  id: string,
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Belum login." };

    const res = await fetchAPI<any>(
      `/pegawai/cuti?nip=${encodeURIComponent(id)}`,
    );
    if (res && res.data) {
      return { success: true, data: res.data };
    }
    return { success: false, error: "Data tidak ditemukan." };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Gagal mengambil data cuti.",
    };
  }
}

export async function createDataCutiAction(
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Belum login." };

    const nama = String(formData.get("nama") || "");
    const nip = String(formData.get("nip") || "");
    const jabatan = String(formData.get("jabatan") || "");
    const unitKerja = String(formData.get("unitKerja") || "");
    const golongan = String(formData.get("golongan") || "");
    const jenisPegawai = String(formData.get("jenisPegawai") || "PNS");

    const res = await fetchAPI<any>("/admin/cuti/pegawai", {
      method: "POST",
      body: JSON.stringify({
        nama,
        nip,
        jabatan,
        unitKerja,
        golongan,
        jenisPegawai,
      }),
    });

    revalidatePath("/admin/kepegawaian/pegawai");
    return {
      success: true,
      message: res.message || "Pegawai berhasil ditambahkan.",
      data: res.data,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menambah data." };
  }
}

export async function updateDataCutiAction(
  id: string,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Belum login." };

    const nama = String(formData.get("nama") || "");
    const jabatan = String(formData.get("jabatan") || "");
    const unitKerja = String(formData.get("unitKerja") || "");
    const golongan = String(formData.get("golongan") || "");
    const jenisPegawai = String(formData.get("jenisPegawai") || "PNS");

    const res = await fetchAPI<any>(`/admin/cuti/pegawai/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        nama,
        jabatan,
        unitKerja,
        golongan,
        jenisPegawai,
      }),
    });

    revalidatePath("/admin/kepegawaian/pegawai");
    return {
      success: true,
      message: res.message || "Data pegawai berhasil diperbarui.",
      data: res.data,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mengubah data." };
  }
}

export async function deleteDataCutiAction(
  id: string,
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Belum login." };

    const res = await fetchAPI<any>(`/admin/cuti/pegawai/${id}`, {
      method: "DELETE",
    });

    revalidatePath("/admin/kepegawaian/pegawai");
    return {
      success: true,
      message: res.message || "Data pegawai berhasil dihapus.",
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menghapus data." };
  }
}

export async function createRekapCutiAction(
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Belum login." };

    const pegawaiId = String(formData.get("pegawaiId") || "");
    const tahunTarget = Number(formData.get("tahunTarget") || 2026);
    const jumlahCuti = Number(formData.get("jumlahCuti") || 12);
    const cutiTahun1 = Number(formData.get("cutiTahun1") || 0);
    const cutiTahun2 = Number(formData.get("cutiTahun2") || 0);
    const cutiAlasanPenting = Number(formData.get("cutiAlasanPenting") || 0);
    const cutiBesar = Number(formData.get("cutiBesar") || 0);
    const cutiBersalin = Number(formData.get("cutiBersalin") || 0);
    const cutiSakit = Number(formData.get("cutiSakit") || 0);
    const sisaCuti = Number(formData.get("sisaCuti") || 12);

    const res = await fetchAPI<any>("/admin/cuti/rekap", {
      method: "POST",
      body: JSON.stringify({
        pegawaiId,
        tahunTarget,
        jumlahCuti,
        cutiTahun1,
        cutiTahun2,
        cutiAlasanPenting,
        cutiBesar,
        cutiBersalin,
        cutiSakit,
        sisaCuti,
      }),
    });

    revalidatePath("/admin/kepegawaian/pegawai");
    return {
      success: true,
      message: res.message || "Rekap cuti berhasil ditambahkan.",
      data: res.data,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Gagal menambah rekap cuti.",
    };
  }
}

export async function updateRekapCutiAction(
  id: string,
  formData: FormData,
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Belum login." };

    const pegawaiId = String(formData.get("pegawaiId") || "");
    const tahunTarget = Number(formData.get("tahunTarget") || 2026);
    const jumlahCuti = Number(formData.get("jumlahCuti") || 12);
    const cutiTahun1 = Number(formData.get("cutiTahun1") || 0);
    const cutiTahun2 = Number(formData.get("cutiTahun2") || 0);
    const cutiAlasanPenting = Number(formData.get("cutiAlasanPenting") || 0);
    const cutiBesar = Number(formData.get("cutiBesar") || 0);
    const cutiBersalin = Number(formData.get("cutiBersalin") || 0);
    const cutiSakit = Number(formData.get("cutiSakit") || 0);
    const sisaCuti = Number(formData.get("sisaCuti") || 12);

    const res = await fetchAPI<any>(`/admin/cuti/rekap/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        pegawaiId,
        tahunTarget,
        jumlahCuti,
        cutiTahun1,
        cutiTahun2,
        cutiAlasanPenting,
        cutiBesar,
        cutiBersalin,
        cutiSakit,
        sisaCuti,
      }),
    });

    revalidatePath("/admin/kepegawaian/pegawai");
    return {
      success: true,
      message: res.message || "Rekap cuti berhasil diperbarui.",
      data: res.data,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Gagal mengubah rekap cuti.",
    };
  }
}

export async function deleteRekapCutiAction(
  id: string,
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Belum login." };

    const res = await fetchAPI<any>(`/admin/cuti/rekap/${id}`, {
      method: "DELETE",
    });

    revalidatePath("/admin/kepegawaian/pegawai");
    return {
      success: true,
      message: res.message || "Rekap cuti berhasil dihapus.",
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Gagal menghapus rekap cuti.",
    };
  }
}

// TODO: Implementasi parser CSV & import batch ke database
export async function importCutiCsvAction(
  _formData: FormData,
): Promise<ActionResponse> {
  return { success: false, error: "Belum diimplementasikan." };
}

// TODO: Implementasi API client sinkronisasi data dari Pusdatin Kemenag
export async function syncDataPegawaiFromPusdatinAction(): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Belum login." };

    revalidatePath("/admin/kepegawaian/pegawai");
    return { success: true, message: "Berhasil sinkronisasi." };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Gagal sinkronisasi data dari Pusdatin.",
    };
  }
}

export async function rolloverCutiTahunanAction(
  tahunTujuan: number,
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Belum login." };

    const res = await fetchAPI<any>("/admin/cuti/rollover", {
      method: "POST",
      body: JSON.stringify({ tahunTujuan }),
    });

    revalidatePath("/admin/kepegawaian/pegawai");
    return {
      success: true,
      message: res.message || `Tutup buku berhasil untuk tahun ${tahunTujuan}.`,
      count: res.count,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Gagal melakukan tutup buku.",
    };
  }
}
