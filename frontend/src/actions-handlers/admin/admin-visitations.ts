import { revalidatePath } from "@/lib/next-compat/cache";
import { requirePermission } from "@/lib/auth";
import { fetchAPI } from "@/lib/api";
import { createAuditLog } from "@/lib/audit";
import { emitRefreshSignal } from "@/lib/supabase/broadcast";

export type ActionResult = {
  success: boolean;
  message?: string;
  error?: string;
};

export async function deleteGuestBookAction(
  idStr: string,
): Promise<ActionResult> {
  const profile = await requirePermission("buku_tamu");
  try {
    await fetchAPI(`/admin/guest-book/${idStr}`, {
      method: "DELETE",
    });

    await createAuditLog({
      adminId: profile.id,
      action: "HAPUS_BUKU_TAMU",
      entityType: "guest_book",
      entityId: idStr,
    });

    revalidatePath("/admin/buku-tamu");
    revalidatePath("/buku-tamu");

    await emitRefreshSignal();
    return { success: true, message: "Catatan buku tamu berhasil dihapus" };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal menghapus data buku tamu",
    };
  }
}

export async function deleteAppointmentAction(
  idStr: string,
): Promise<ActionResult> {
  const profile = await requirePermission("janji_temu");
  try {
    await fetchAPI(`/admin/appointments/${idStr}`, {
      method: "DELETE",
    });

    await createAuditLog({
      adminId: profile.id,
      action: "HAPUS_JANJI_TEMU",
      entityType: "appointments",
      entityId: idStr,
    });

    revalidatePath("/admin/janji-temu");
    return { success: true, message: "Catatan janji temu berhasil dihapus" };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal menghapus data janji temu",
    };
  }
}

export async function updateAppointmentStatusAction(
  idStr: string,
  status: "pending" | "approved" | "rejected",
): Promise<ActionResult> {
  const profile = await requirePermission("janji_temu");
  try {
    await fetchAPI(`/admin/appointments/${idStr}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });

    await createAuditLog({
      adminId: profile.id,
      action: `UPDATE_STATUS_JANJI_TEMU_${status.toUpperCase()}`,
      entityType: "appointments",
      entityId: idStr,
      details: { newStatus: status },
    });

    revalidatePath("/admin/janji-temu");
    return {
      success: true,
      message: `Status janji temu berhasil diubah menjadi ${status === "approved" ? "Disetujui" : status === "rejected" ? "Ditolak" : "Menunggu"}`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal memperbarui status janji temu",
    };
  }
}

export async function toggleGuestBookModeAction(
  allowManual: boolean,
): Promise<ActionResult> {
  const profile = await requirePermission("buku_tamu");
  try {
    await fetchAPI("/admin/system/guest-book-mode", {
      method: "PATCH",
      body: JSON.stringify({ allowManual }),
    });

    await createAuditLog({
      adminId: profile.id,
      action: "UBAH_MODE_BUKU_TAMU",
      entityType: "system_status",
      entityId: "heartbeat",
      details: {
        allowManualGuestBookDate: allowManual,
      },
    });

    revalidatePath("/admin/buku-tamu");
    revalidatePath("/buku-tamu");

    await emitRefreshSignal();
    return {
      success: true,
      message: `Mode Buku Tamu berhasil diubah menjadi ${allowManual ? "Manual" : "Otomatis"}`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal mengubah mode buku tamu",
    };
  }
}
