import { db } from "@/lib/db";
import {
  serviceRequests,
  activityLogs,
  generatedDocuments,
  serviceRequestDocuments,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createAuditLog } from "@/lib/audit";
import { deleteFromR2, uploadToR2 } from "@/lib/r2";
import { NotificationService } from "../notification-service";
import { uploadToGoogleDrive } from "@/lib/google-drive";

export class RequestAdminService {
  /**
   * Update the status of a request and log the activity
   */
  static async updateStatus(
    requestId: string,
    newStatus: string,
    notes: string,
    adminId: string
  ) {
    const patch: any = { status: newStatus };

    if (newStatus === "revision_required") {
      patch.revisionNote = notes || null;
      patch.completedAt = null;
    } else {
      patch.revisionNote = null;
    }

    if (newStatus === "rejected") {
      patch.rejectionReason = notes || null;
      patch.rejectedAt = new Date();
      patch.completedAt = null;
      patch.approvedAt = null;
    } else {
      patch.rejectionReason = null;
    }

    if (newStatus === "approved") {
      patch.approvedAt = new Date();
      patch.completedAt = null;
    }

    if (newStatus === "completed") {
      patch.completedAt = new Date();
    }

    if (newStatus === "under_review") {
      patch.completedAt = null;
      patch.approvedAt = null;
      patch.rejectedAt = null;
    }

    if (newStatus === "spam") {
      patch.completedAt = null;
      patch.approvedAt = null;
      patch.rejectedAt = null;
      patch.rejectionReason = notes || "Ditandai sebagai spam/palsu";
    }

    const actionMap: Record<string, string> = {
      under_review: "status:under_review",
      revision_required: "status:revision_required",
      rejected: "status:rejected",
      approved: "status:approved",
      completed: "status:completed",
      spam: "status:spam",
    };

    return await db.transaction(async (tx) => {
      // Fetch request details for personalized notification
      const req = await tx.query.serviceRequests.findFirst({
        where: eq(serviceRequests.id, requestId),
        columns: { userId: true, requestNumber: true },
      });
      const targetUserId = req?.userId;
      const requestNumber = req?.requestNumber || requestId.slice(-8).toUpperCase();

      await tx
        .update(serviceRequests)
        .set(patch)
        .where(eq(serviceRequests.id, requestId));

      await tx.insert(activityLogs).values({
        requestId,
        action: actionMap[newStatus] || `status:${newStatus}`,
        notes: notes || null,
        actorId: adminId,
      });

      await createAuditLog({
        adminId,
        action: `merubah_status_${newStatus}`,
        entityType: "service_request",
        entityId: requestId,
        details: { catatan: notes },
      });

      // Create Real Notification for the user who made the request
      if (targetUserId) {
        await NotificationService.create({
          userId: targetUserId,
          type: newStatus === "rejected" || newStatus === "spam" ? "error" : "success",
          title: `Status Pengajuan Berubah`,
          message: `Pengajuan dengan nomor ${requestNumber} telah diupdate menjadi ${newStatus.replace("_", " ")}.`,
          link: `/dashboard/pengajuan/${requestId}`,
        });
      }
    });
  }

  /**
   * Upload a result document and potentially update request status
   */
  static async uploadResult(
    requestId: string,
    file: File,
    adminId: string
  ) {
    const request = await db.query.serviceRequests.findFirst({
      where: eq(serviceRequests.id, requestId),
      with: { 
        profiles: true,
        serviceRequestAnswers: true, 
      },
    });

    if (!request) throw new Error("Pengajuan tidak ditemukan");

    const fileExt = file.name.split(".").pop() || "pdf";
    const userName = (request as any).profiles?.fullName?.trim() || "Pemohon";
    const safeName = userName.replace(/[^a-zA-Z0-9]/g, "_").replace(/_{2,}/g, "_");
    const fileName = `${request.requestNumber}_${safeName}.${fileExt}`;

    // Cleanup existing docs
    const existingDoc = await db.query.generatedDocuments.findFirst({
      where: eq(generatedDocuments.requestId, request.id),
    });

    if (existingDoc?.filePath?.startsWith("r2:")) {
      await deleteFromR2(existingDoc.filePath).catch(() => {});
    }

    const r2Path = `results/${request.requestNumber}/${fileName}`;
    const r2Result = await uploadToR2(file, r2Path);

    if (!r2Result.path) throw new Error("Gagal mengunggah file ke Cloudflare R2");

    // Dual-Storage: Upload backup to Google Drive
    try {
      await uploadToGoogleDrive(file, `results/${request.requestNumber}`);
    } catch (gdriveError) {
      console.error("Google Drive backup failed for result document:", gdriveError);
    }

    const nextStatus = ["approved", "completed"].includes(request.status || "")
      ? "completed"
      : request.status;

    await db.transaction(async (tx) => {
      await tx.delete(generatedDocuments).where(eq(generatedDocuments.requestId, request.id));
      await tx.insert(generatedDocuments).values({
        requestId: request.id,
        fileName,
        filePath: r2Result.path,
        generatedBy: adminId,
        generatedAt: new Date(),
      });

      if (request.status !== nextStatus) {
        await tx.update(serviceRequests).set({
          status: nextStatus as any,
          completedAt: nextStatus === "completed" ? new Date() : request.completedAt,
        }).where(eq(serviceRequests.id, request.id));
      }

      await tx.insert(activityLogs).values({
        requestId: request.id,
        action: "manual_document_uploaded",
        notes: "Dokumen hasil diunggah secara manual oleh admin.",
        actorId: adminId,
      });

      await createAuditLog({
        adminId,
        action: "unggah_dokumen_hasil",
        entityType: "service_request",
        entityId: requestId,
        details: { file_name: fileName, status_akhir: nextStatus },
      });

      // Notification: Document uploaded
      await NotificationService.create({
        userId: request.userId,
        type: "success",
        title: "Dokumen Hasil Diunggah",
        message: `Dokumen hasil "${fileName}" telah diunggah untuk pengajuan ${request.requestNumber}.`,
        link: `/dashboard/pengajuan/${requestId}`,
      });
    });
  }

  /**
   * Delete a request and all its associated files
   */
  static async deleteRequest(requestId: string, adminId: string) {
    const [reqDocs, genDocs] = await Promise.all([
      db.select({ filePath: serviceRequestDocuments.filePath }).from(serviceRequestDocuments).where(eq(serviceRequestDocuments.requestId, requestId)),
      db.query.generatedDocuments.findFirst({ where: eq(generatedDocuments.requestId, requestId) }),
    ]);

    const allFilePaths = [
      ...reqDocs.map((d) => d.filePath),
      ...(genDocs ? [genDocs.filePath] : []),
    ];

    for (const path of allFilePaths) {
      if (!path) continue;
      if (path.startsWith("r2:")) {
        await deleteFromR2(path).catch(() => {});
      }
    }

    await db.delete(serviceRequests).where(eq(serviceRequests.id, requestId));
    
    await createAuditLog({
      adminId,
      action: "hapus_pengajuan",
      entityType: "service_request",
      entityId: requestId,
    });

    // Notification: Request deleted
    await NotificationService.create({
      type: "warning",
      title: "Pengajuan Dihapus",
      message: `Pengajuan ${requestId.slice(-8).toUpperCase()} telah dihapus permanen oleh admin.`,
    });
  }
}
