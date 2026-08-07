"use server";

import { getCurrentUser, requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { fetchAPI } from "@/lib/api";
import { createAuditLog } from "@/lib/audit";

export async function approveByAtasanAction(
  id: string,
  signature: string,
  catatan?: string,
) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Anda belum login." };

    await requireAuth();

    if (!signature) {
      return { error: "Tanda tangan wajib dilampirkan." };
    }

    await fetchAPI(`/pegawai/cuti/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        status: "approved_atasan",
        catatan: catatan || "Disetujui oleh Atasan Langsung",
        signature,
      }),
    });

    await createAuditLog({
      adminId: user.id,
      action: "APPROVE_CUTI_ATASAN",
      entityType: "cuti",
      entityId: id,
    });

    revalidatePath("/pegawai/cuti/persetujuan");
    return { success: true };
  } catch (err: any) {
    console.error("Approve Atasan Error:", err);
    return { error: err.message || "Gagal menyetujui pengajuan cuti." };
  }
}

export async function rejectByAtasanAction(id: string, alasan: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Anda belum login." };

    await requireAuth();

    if (!alasan) {
      return { error: "Alasan penolakan wajib diisi." };
    }

    await fetchAPI(`/pegawai/cuti/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        status: "rejected",
        catatan: alasan,
      }),
    });

    await createAuditLog({
      adminId: user.id,
      action: "REJECT_CUTI_ATASAN",
      entityType: "cuti",
      entityId: id,
    });

    revalidatePath("/pegawai/cuti/persetujuan");
    return { success: true };
  } catch (err: any) {
    console.error("Reject Atasan Error:", err);
    return { error: err.message || "Gagal menolak pengajuan cuti." };
  }
}

export async function approveByKepalaAction(
  id: string,
  signature: string,
  catatan?: string,
) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Anda belum login." };

    await requireAuth();

    if (!signature) {
      return { error: "Tanda tangan wajib dilampirkan." };
    }

    await fetchAPI(`/pegawai/cuti/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        status: "approved_kepala",
        catatan: catatan || "Disetujui oleh Kepala / Pejabat Berwenang",
        signature,
      }),
    });

    await createAuditLog({
      adminId: user.id,
      action: "APPROVE_CUTI_KEPALA",
      entityType: "cuti",
      entityId: id,
    });

    revalidatePath("/pegawai/cuti/persetujuan");
    return { success: true };
  } catch (err: any) {
    console.error("Approve Kepala Error:", err);
    return { error: err.message || "Gagal menyetujui pengajuan cuti." };
  }
}

export async function rejectByKepalaAction(id: string, alasan: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Anda belum login." };

    await requireAuth();

    if (!alasan) {
      return { error: "Alasan penolakan wajib diisi." };
    }

    await fetchAPI(`/pegawai/cuti/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        status: "rejected",
        catatan: alasan,
      }),
    });

    await createAuditLog({
      adminId: user.id,
      action: "REJECT_CUTI_KEPALA",
      entityType: "cuti",
      entityId: id,
    });

    revalidatePath("/pegawai/cuti/persetujuan");
    return { success: true };
  } catch (err: any) {
    console.error("Reject Kepala Error:", err);
    return { error: err.message || "Gagal menolak pengajuan cuti." };
  }
}

export async function getPersetujuanCutiListAction() {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Anda belum login." };

    const res = await fetchAPI<any>(`/pegawai/cuti?user_id=${user.id}`);
    return { data: res?.data || [] };
  } catch (err: any) {
    console.error("Gagal mengambil persetujuan cuti:", err);
    return { error: err.message || "Gagal mengambil persetujuan cuti." };
  }
}

export async function getVerifikasiCutiAtasan() {
  return getPersetujuanCutiListAction();
}

export async function verifikasiCutiAtasanAction(
  id: string,
  approved: boolean,
  catatan?: string,
  signature?: string,
) {
  if (approved) {
    return approveByAtasanAction(id, signature || "", catatan);
  }
  return rejectByAtasanAction(id, catatan || "");
}

export async function processCutiAction(
  id: string,
  status: string,
  catatan?: string,
  signature?: string,
) {
  if (status === "approved_atasan") {
    return approveByAtasanAction(id, signature || "", catatan);
  }
  if (status === "approved_kepala") {
    return approveByKepalaAction(id, signature || "", catatan);
  }
  return rejectByAtasanAction(id, catatan || "");
}
