"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";
import { emitRefreshSignal } from "@/lib/supabase/broadcast";
import { RequestService } from "@/lib/services/request-service";
import { db } from "@/lib/db";
import { activityLogs, serviceRequests } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { isSuperAdmin, getAdminSpecificRole } from "@/lib/constants";
import { createAuditLog } from "@/lib/audit";
import { sendWhatsAppNotification } from "@/lib/whatsapp";
import { getR2SignedUrl } from "@/lib/r2";

async function verifyRequestOwnership(requestId: string, email: string, role: string) {
  const isSuper = isSuperAdmin(email);
  const specificRole = getAdminSpecificRole(email, role);
  const isGeneralAdmin = specificRole === "admin_ptsp";

  if (isSuper || isGeneralAdmin) return true;

  const request = await db.query.serviceRequests.findFirst({
    where: eq(serviceRequests.id, requestId),
    with: {
      services: { columns: { roleOwner: true } },
    },
  });

  if (!request || request.services?.roleOwner !== specificRole) {
    throw new Error("Anda tidak memiliki akses ke pengajuan ini");
  }

  return true;
}

export type ActionResult = {
  success: boolean;
  message?: string;
  error?: string;
};

const UpdateStatusSchema = z.object({
  requestId: z.string().uuid(),
  status: z.enum([
    "under_review",
    "revision_required",
    "rejected",
    "approved",
    "completed",
    "spam",
  ]),
  notes: z.string().optional(),
});

export async function updateRequestStatusAction(
  formData: FormData,
): Promise<ActionResult> {
  const adminProfile = await requireAdmin();
  try {
    const validated = UpdateStatusSchema.safeParse({
      requestId: formData.get("requestId"),
      status: formData.get("status"),
      notes: formData.get("notes") || undefined,
    });

    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const { requestId, status, notes = "" } = validated.data;

    await verifyRequestOwnership(requestId, adminProfile.email ?? "", adminProfile.role ?? "");

    await RequestService.updateStatus(requestId, status, notes, adminProfile.id);

    revalidatePath("/admin/pengajuan");
    revalidatePath(`/admin/pengajuan/${requestId}`);
    await emitRefreshSignal();

    return { success: true, message: "Status pengajuan berhasil diperbarui" };
  } catch (error: any) {
    console.error("Error updating status:", error);
    return { success: false, error: error.message || "Gagal memperbarui status" };
  }
}

const UploadResultSchema = z.object({
  requestId: z.string().uuid(),
  file: z
    .instanceof(File)
    .refine(
      (file) => file.size > 0,
      "File wajib diunggah dan tidak boleh kosong",
    ),
});

export async function uploadResultDocumentAction(
  formData: FormData,
): Promise<ActionResult> {
  const adminProfile = await requireAdmin();
  try {
    const validated = UploadResultSchema.safeParse({
      requestId: formData.get("requestId"),
      file: formData.get("file"),
    });

    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const { requestId, file } = validated.data;

    await verifyRequestOwnership(requestId, adminProfile.email ?? "", adminProfile.role ?? "");

    await RequestService.uploadResult(requestId, file, adminProfile.id);

    revalidatePath("/admin/pengajuan");
    revalidatePath("/admin/dokumen-hasil");
    await emitRefreshSignal();

    return { success: true, message: "Dokumen hasil berhasil diunggah" };
  } catch (error: any) {
    console.error("Error uploading result:", error);
    return {
      success: false,
      error: error.message || "Gagal mengunggah dokumen hasil",
    };
  }
}

const SendWASchema = z.object({
  requestId: z.string().uuid(),
});

export async function sendResultWhatsAppAction(
  formData: FormData,
): Promise<ActionResult> {
  const adminProfile = await requireAdmin();
  try {
    const validated = SendWASchema.safeParse({
      requestId: formData.get("requestId"),
    });

    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const { requestId } = validated.data;
    await verifyRequestOwnership(requestId, adminProfile.email ?? "", adminProfile.role ?? "");

    const request = await db.query.serviceRequests.findFirst({
      where: eq(serviceRequests.id, requestId),
      with: { 
        profiles: true,
        serviceRequestAnswers: true, 
        generatedDocuments: true,
      },
    });

    if (!request) {
      return { success: false, error: "Pengajuan tidak ditemukan" };
    }

    let phone = (request as any).profiles?.phone || "";
    if (request.serviceRequestAnswers) {
      const waAnswer = request.serviceRequestAnswers.find((a: any) => {
        const name = (a.fieldName || "").toLowerCase();
        return name.includes("whatsapp") || name.includes("wa") || name === "hp";
      });
      if (waAnswer && waAnswer.fieldValue) {
        phone = waAnswer.fieldValue;
      }
    }

    if (!phone) {
      return { success: false, error: "Nomor WhatsApp pemohon tidak ditemukan" };
    }

    let fileUrl: string | undefined = undefined;
    let fileName: string | undefined = undefined;

    const genDoc = (request as any).generatedDocuments?.[0];
    if (genDoc && genDoc.filePath) {
      if (genDoc.filePath.startsWith("r2:") || genDoc.filePath.startsWith("results/")) {
        try {
          fileUrl = await getR2SignedUrl(genDoc.filePath);
          fileName = genDoc.fileName || `Dokumen_Hasil_${request.requestNumber}.pdf`;
        } catch (e) {
          console.error("Gagal get R2 Signed URL untuk WA:", e);
        }
      }
      // Tambahkan logika lain di sini jika file disimpan di Supabase bucket, dsb
    }

    const pesanWA = `*KEMENTERIAN AGAMA KABUPATEN BARITO UTARA*\n\n` +
      `Halo ${(request as any).profiles?.fullName || "Pemohon"},\n\n` +
      `Dokumen hasil untuk pengajuan Anda dengan nomor tiket *${request.requestNumber}* telah diterbitkan dan dilampirkan bersama pesan ini.\n\n` +
      `_Pesan ini dikirim otomatis oleh Sistem PTSP Kemenag Barito Utara._`;
      
    await sendWhatsAppNotification(phone, pesanWA, fileUrl, fileName);

    await db.transaction(async (tx) => {
      if (request.status !== "completed") {
        await tx.update(serviceRequests)
          .set({ status: "completed", completedAt: new Date() })
          .where(eq(serviceRequests.id, requestId));
          
        await tx.insert(activityLogs).values({
          requestId: requestId,
          actorId: adminProfile.id,
          action: "status:completed",
          notes: "Status pengajuan diubah menjadi Selesai (Dokumen dikirim).",
        });
      }

      await tx.insert(activityLogs).values({
        requestId: requestId,
        actorId: adminProfile.id,
        action: "KIRIM_WA_HASIL",
        notes: "Dokumen hasil pengajuan telah dikirimkan via WhatsApp ke pemohon.",
      });
    });

    await createAuditLog({
      adminId: adminProfile.id,
      action: "KIRIM_WA_HASIL",
      entityType: "service_request",
      entityId: requestId,
      details: { phone },
    });

    return { success: true, message: "Notifikasi WhatsApp berhasil dikirim" };
  } catch (error: any) {
    console.error("Error sending WA:", error);
    return { success: false, error: error.message || "Gagal mengirim notifikasi WhatsApp" };
  }
}

const DeleteRequestSchema = z.object({
  requestId: z.string().uuid(),
});

export async function deleteRequestAction(
  formData: FormData,
): Promise<ActionResult> {
  const adminProfile = await requireAdmin();
  try {
    const validated = DeleteRequestSchema.safeParse({
      requestId: formData.get("requestId"),
    });

    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const { requestId } = validated.data;

    await verifyRequestOwnership(requestId, adminProfile.email ?? "", adminProfile.role ?? "");

    await RequestService.deleteRequest(requestId, adminProfile.id);

    await createAuditLog({
      adminId: adminProfile.id,
      action: "HAPUS_PENGAJUAN",
      entityType: "service_request",
      entityId: requestId,
    });

    revalidatePath("/admin/pengajuan");
    revalidatePath("/admin/dokumen-hasil");
    revalidatePath("/track");
    revalidatePath("/");

    return { success: true, message: "Pengajuan berhasil dihapus" };
  } catch (error: any) {
    console.error("Error deleting request:", error);
    return { success: false, error: error.message || "Gagal menghapus pengajuan" };
  }
}

const LogActionSchema = z.object({
  logId: z.string(),
  requestId: z.string().uuid(),
});

export async function deleteActivityLogAction(
  formData: FormData,
): Promise<ActionResult> {
  const adminProfile = await requireAdmin();
  try {
    const validated = LogActionSchema.safeParse({
      logId: formData.get("logId"),
      requestId: formData.get("requestId"),
    });

    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const { logId, requestId } = validated.data;

    await verifyRequestOwnership(requestId, adminProfile.email ?? "", adminProfile.role ?? "");

    await db
      .delete(activityLogs)
      .where(
        and(
          eq(activityLogs.id, BigInt(logId)),
          eq(activityLogs.requestId, requestId)
        )
      );

    // Sync status with latest status log
    const latestLog = await db.query.activityLogs.findFirst({
      where: (t, { eq, and, like }) => and(
        eq(t.requestId, requestId), 
        like(t.action, "status:%")
      ),
      orderBy: (t, { desc }) => [desc(t.createdAt)],
    });

    const newStatus = latestLog ? latestLog.action.replace("status:", "") : "under_review";
    
    await db.update(serviceRequests)
      .set({ status: newStatus as any })
      .where(eq(serviceRequests.id, requestId));

    await createAuditLog({
      adminId: adminProfile.id,
      action: "HAPUS_AKTIVITAS_LOG",
      entityType: "activity_log",
      entityId: logId,
      details: { requestId, statusRevertedTo: newStatus },
    });

    revalidatePath(`/admin/pengajuan/${requestId}`);

    return { success: true, message: "Log aktivitas berhasil dihapus, status dikembalikan" };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menghapus log" };
  }
}

const UpdateLogSchema = LogActionSchema.extend({
  notes: z.string().optional(),
});

export async function updateActivityLogAction(
  formData: FormData,
): Promise<ActionResult> {
  const adminProfile = await requireAdmin();
  try {
    const validated = UpdateLogSchema.safeParse({
      logId: formData.get("logId"),
      requestId: formData.get("requestId"),
      notes: formData.get("notes") || undefined,
    });

    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const { logId, requestId, notes = "" } = validated.data;

    await verifyRequestOwnership(requestId, adminProfile.email ?? "", adminProfile.role ?? "");

    await db
      .update(activityLogs)
      .set({ notes })
      .where(
        and(
          eq(activityLogs.id, BigInt(logId)),
          eq(activityLogs.requestId, requestId)
        )
      );

    await createAuditLog({
      adminId: adminProfile.id,
      action: "UBAH_AKTIVITAS_LOG",
      entityType: "activity_log",
      entityId: logId,
      details: { requestId, notes },
    });

    revalidatePath(`/admin/pengajuan/${requestId}`);

    return { success: true, message: "Log aktivitas berhasil diperbarui" };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal memperbarui log" };
  }
}
