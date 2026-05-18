"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth";
import { db } from "@/lib/db";
import { guestBook, appointments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createAuditLog } from "@/lib/audit";

export type ActionResult = {
  success: boolean;
  message?: string;
  error?: string;
};

export async function deleteGuestBookAction(idStr: string): Promise<ActionResult> {
  try {
    const profile = await requirePermission("buku_tamu");
    const id = BigInt(idStr);

    const entry = await db.query.guestBook.findFirst({
      where: eq(guestBook.id, id),
    });

    if (!entry) {
      return { success: false, error: "Data buku tamu tidak ditemukan" };
    }

    await db.delete(guestBook).where(eq(guestBook.id, id));

    await createAuditLog({
      adminId: profile.id,
      action: "HAPUS_BUKU_MUTASI",
      entityType: "guest_book",
      entityId: idStr,
      details: {
        guestName: entry.guestName,
        whatsapp: entry.whatsapp,
        institutionName: entry.institutionName,
      },
    });

    revalidatePath("/admin/buku-tamu");
    return { success: true, message: "Catatan buku tamu berhasil dihapus" };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menghapus data buku tamu" };
  }
}

export async function deleteAppointmentAction(idStr: string): Promise<ActionResult> {
  try {
    const profile = await requirePermission("janji_temu");
    const id = BigInt(idStr);

    const entry = await db.query.appointments.findFirst({
      where: eq(appointments.id, id),
    });

    if (!entry) {
      return { success: false, error: "Data janji temu tidak ditemukan" };
    }

    await db.delete(appointments).where(eq(appointments.id, id));

    await createAuditLog({
      adminId: profile.id,
      action: "HAPUS_JANJI_TEMU",
      entityType: "appointments",
      entityId: idStr,
      details: {
        guestName: entry.guestName,
        whatsapp: entry.whatsapp,
        appointmentDate: entry.appointmentDate,
      },
    });

    revalidatePath("/admin/janji-temu");
    return { success: true, message: "Catatan janji temu berhasil dihapus" };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menghapus data janji temu" };
  }
}

export async function updateAppointmentStatusAction(
  idStr: string,
  status: "pending" | "approved" | "rejected"
): Promise<ActionResult> {
  try {
    const profile = await requirePermission("janji_temu");
    const id = BigInt(idStr);

    const entry = await db.query.appointments.findFirst({
      where: eq(appointments.id, id),
    });

    if (!entry) {
      return { success: false, error: "Data janji temu tidak ditemukan" };
    }

    await db
      .update(appointments)
      .set({ status, updatedAt: new Date() })
      .where(eq(appointments.id, id));

    await createAuditLog({
      adminId: profile.id,
      action: `UPDATE_STATUS_JANJI_TEMU_${status.toUpperCase()}`,
      entityType: "appointments",
      entityId: idStr,
      details: {
        guestName: entry.guestName,
        oldStatus: entry.status,
        newStatus: status,
      },
    });

    revalidatePath("/admin/janji-temu");
    return { success: true, message: `Status janji temu berhasil diubah menjadi ${status === "approved" ? "Disetujui" : status === "rejected" ? "Ditolak" : "Menunggu"}` };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal memperbarui status janji temu" };
  }
}
