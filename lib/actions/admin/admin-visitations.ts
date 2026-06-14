"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth";
import { db } from "@/lib/db";
import { guestBook, appointments } from "@/lib/db/schema";
import { systemStatus } from "@/lib/db/schema/logs";
import { eq } from "drizzle-orm";
import { createAuditLog } from "@/lib/audit";
import { sendWhatsAppNotification } from "@/lib/whatsapp";
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
    revalidatePath("/buku-tamu");
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

    if (status === "approved" || status === "rejected") {
      const dateObj = new Date(entry.appointmentDate);
      const appointmentDateFormatted = dateObj.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const isApproved = status === "approved";
      const waMessage =
        `Halo *${entry.guestName}* 👋\n\n` +
        `Permintaan janji temu Anda telah *${isApproved ? "DISETUJUI ✅" : "DITOLAK ❌"}* oleh Admin.\n\n` +
        `📅 *Detail Janji Temu:*\n` +
        `• Tanggal  : ${appointmentDateFormatted}\n` +
        `• Jam      : ${entry.appointmentTime} WIB\n` +
        `• Bertemu  : ${entry.intendedOfficer}\n` +
        `• Keperluan: ${entry.purpose}\n` +
        (entry.institutionName
          ? `• Instansi : ${entry.institutionName}\n`
          : "") +
        (isApproved
          ? `\nMohon hadir tepat waktu sesuai dengan jadwal yang telah disetujui. Tunjukkan pesan ini kepada petugas saat Anda tiba di lokasi.\n\n`
          : `\nMohon maaf, janji temu Anda belum dapat dipenuhi saat ini. Silakan hubungi kami untuk informasi lebih lanjut.\n\n`) +
        `_Pelayanan Terpadu Satu Pintu (PTSP)_\n` +
        `_Kemenag Kabupaten Barito Utara_`;

      // Tunggu notifikasi WA selesai (menghindari dibunuh oleh Vercel serverless)
      try {
        await sendWhatsAppNotification(entry.whatsapp, waMessage);
      } catch (waErr) {
        console.error("WhatsApp notification failed:", waErr);
      }
    }

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
    // Update system status

    await db
      .update(systemStatus)
      .set({
        notes: allowManual ? "MANUAL_GUESTBOOK_ON" : "MANUAL_GUESTBOOK_OFF",
      })
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
