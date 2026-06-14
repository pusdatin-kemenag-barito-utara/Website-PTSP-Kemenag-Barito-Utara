"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth";
import { db } from "@/lib/db";
import { feedbacks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createAuditLog } from "@/lib/audit";

export type ActionResult = {
  success: boolean;
  message?: string;
  error?: string;
};

export async function deleteFeedbackAction(idStr: string): Promise<ActionResult> {
  const profile = await requirePermission("saran_pengaduan");
  try {
    const id = BigInt(idStr);

    // Fetch the feedback to log in audit trail using Drizzle ORM
    const entry = await db.query.feedbacks.findFirst({
      where: eq(feedbacks.id, id),
    });

    if (!entry) {
      return { success: false, error: "Saran & pengaduan tidak ditemukan" };
    }

    // Delete feedback using Drizzle ORM
    await db.delete(feedbacks).where(eq(feedbacks.id, id));

    // Create Audit Log
    await createAuditLog({
      adminId: profile.id,
      action: "HAPUS_SARAN_PENGADUAN",
      entityType: "feedbacks",
      entityId: idStr,
      details: {
        name: entry.name,
        phone: entry.phone,
        content: entry.content,
      },
    });

    revalidatePath("/admin/e-pengaduan");
    return { success: true, message: "Catatan saran & pengaduan berhasil dihapus" };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menghapus data saran & pengaduan" };
  }
}

export async function updateFeedbackStatusAction(idStr: string, status: "pending" | "processed" | "responded"): Promise<ActionResult> {
  const profile = await requirePermission("saran_pengaduan");
  try {
    const id = BigInt(idStr);

    const entry = await db.query.feedbacks.findFirst({
      where: eq(feedbacks.id, id),
    });

    if (!entry) {
      return { success: false, error: "Data tidak ditemukan" };
    }

    await db
      .update(feedbacks)
      .set({ status, updatedAt: new Date() })
      .where(eq(feedbacks.id, id));

    await createAuditLog({
      adminId: profile.id,
      action: `UPDATE_STATUS_PENGADUAN_${status.toUpperCase()}`,
      entityType: "feedbacks",
      entityId: idStr,
      details: {
        oldStatus: entry.status,
        newStatus: status,
      },
    });

    revalidatePath("/admin/e-pengaduan");
    return { success: true, message: "Status berhasil diperbarui" };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal memperbarui status" };
  }
}

export async function replyFeedbackAction(idStr: string, replyText: string): Promise<ActionResult> {
  const profile = await requirePermission("saran_pengaduan");
  try {
    const id = BigInt(idStr);

    const entry = await db.query.feedbacks.findFirst({
      where: eq(feedbacks.id, id),
    });

    if (!entry) {
      return { success: false, error: "Data tidak ditemukan" };
    }

    await db
      .update(feedbacks)
      .set({ 
        status: "responded", 
        adminReply: replyText,
        updatedAt: new Date() 
      })
      .where(eq(feedbacks.id, id));

    await createAuditLog({
      adminId: profile.id,
      action: "TANGGAPAN_PENGADUAN",
      entityType: "feedbacks",
      entityId: idStr,
      details: {
        replyLength: replyText.length,
      },
    });

    // Send WA Notification
    const { sendWhatsAppNotification } = await import("@/lib/whatsapp");
    
    const waMessage =
      `Halo *${entry.isAnonymous ? "Anonim" : entry.name}* 👋\n\n` +
      `Laporan Anda (${entry.category} - ${entry.serviceType}) telah *ditanggapi* oleh Admin kami.\n\n` +
      `💬 *Tanggapan Admin:*\n` +
      `"${replyText}"\n\n` +
      `Terima kasih atas partisipasi Anda dalam meningkatkan kualitas layanan kami.\n\n` +
      `_Pelayanan Terpadu Satu Pintu (PTSP)_\n` +
      `_Kemenag Kabupaten Barito Utara_`;

    try {
      await sendWhatsAppNotification(entry.phone, waMessage);
    } catch (waErr) {
      console.error("WhatsApp reply failed:", waErr);
    }

    revalidatePath("/admin/e-pengaduan");
    return { success: true, message: "Tanggapan berhasil dikirim" };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal mengirim tanggapan" };
  }
}
