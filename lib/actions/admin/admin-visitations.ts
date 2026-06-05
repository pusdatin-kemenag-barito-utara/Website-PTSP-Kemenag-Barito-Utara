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
  const profile = await requirePermission("buku_tamu");
  try {
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
      action: "HAPUS_BUKU_TAMU",
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

export async function addManualGuestBookAction(data: {
  guestName: string;
  whatsapp: string;
  institutionType: string;
  institutionName?: string | null;
  intendedOfficer: string;
  purpose: string;
  visitDate: string;
}): Promise<ActionResult & { data?: any }> {
  const profile = await requirePermission("buku_tamu");
  try {
    const inserted = await db
      .insert(guestBook)
      .values({
        guestName: data.guestName,
        whatsapp: data.whatsapp,
        institutionType: data.institutionType,
        institutionName: data.institutionName || null,
        intendedOfficer: data.intendedOfficer,
        purpose: data.purpose,
        visitDate: data.visitDate,
      })
      .returning();

    await createAuditLog({
      adminId: profile.id,
      action: "TAMBAH_MANUAL_BUKU_TAMU",
      entityType: "guest_book",
      entityId: inserted[0].id.toString(),
      details: {
        guestName: data.guestName,
        visitDate: data.visitDate,
      },
    });

    revalidatePath("/admin/buku-tamu");
    return { success: true, message: "Kunjungan berhasil ditambahkan secara manual", data: inserted[0] };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menyimpan data kunjungan" };
  }
}

export async function deleteAppointmentAction(idStr: string): Promise<ActionResult> {
  const profile = await requirePermission("janji_temu");
  try {
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
  const profile = await requirePermission("janji_temu");
  try {
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

export async function toggleGuestBookModeAction(allowManual: boolean): Promise<ActionResult> {
  const profile = await requirePermission("buku_tamu");
  try {
    // Import systemStatus schema
    const { systemStatus } = await import("@/lib/db/schema/logs");
    
    await db
      .update(systemStatus)
      .set({ notes: allowManual ? "MANUAL_GUESTBOOK_ON" : "MANUAL_GUESTBOOK_OFF" })
      .where(eq(systemStatus.id, "heartbeat"));

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

    // Broadcast refresh signal to all connected clients
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      // @ts-ignore
      await supabase.channel('app-sync').httpSend('refresh', { action: 'toggle_guest_book_mode', allowManual });
    } catch (broadcastErr) {
      console.error("Failed to broadcast refresh:", broadcastErr);
    }

    return { success: true, message: `Mode Buku Tamu berhasil diubah menjadi ${allowManual ? "Manual" : "Otomatis"}` };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal mengubah mode buku tamu" };
  }
}
