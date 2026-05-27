import { db } from "@/lib/db";
import {
  serviceRequests,
  activityLogs,
  serviceRequestDocuments,
} from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import {
  serviceFormFields as serviceFormFieldsTable,
  serviceRequirements as serviceRequirementsTable,
  serviceRequestAnswers as serviceRequestAnswersTable,
  profiles as profilesTable,
} from "@/lib/db/schema";
import { sanitizeFilename } from "@/lib/utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteFromR2, uploadToR2 } from "@/lib/r2";
import { NotificationService } from "../notification-service";
import { uploadToGoogleDrive } from "@/lib/google-drive";

export class RequestApplicantService {
  /**
   * Create a new request by an applicant
   */
  static async createByApplicant(params: {
    userId: string;
    serviceId: bigint;
    serviceItemId: bigint;
    formData: FormData;
  }) {
    const { userId, serviceId, serviceItemId, formData } = params;

    const [fields, requirements, userProfile] = await Promise.all([
      db.query.serviceFormFields.findMany({
        where: eq(serviceFormFieldsTable.serviceItemId, serviceItemId),
        orderBy: [asc(serviceFormFieldsTable.sortOrder)],
      }),
      db.query.serviceRequirements.findMany({
        where: eq(serviceRequirementsTable.serviceItemId, serviceItemId),
        orderBy: [asc(serviceRequirementsTable.id)],
      }),
      db.query.profiles.findFirst({
        where: eq(profilesTable.id, userId),
        columns: { fullName: true },
      }),
    ]);

    // Create Request in Transaction
    const result = await db.transaction(async (tx) => {
      const [createdRequest] = await tx
        .insert(serviceRequests)
        .values({
          userId: userId,
          serviceId: serviceId,
          serviceItemId: serviceItemId,
          requestNumber: `TEMP-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, // Fallback for fresh DB
          status: "submitted" as any,
          submittedAt: new Date(),
        } as any)
        .returning();

      const answersData = fields.map((field) => ({
        requestId: createdRequest.id,
        fieldId: field.id,
        fieldName: field.label,
        fieldValue: String(formData.get(`answer_${field.id}`) || ""),
      }));

      if (answersData.length) {
        await tx.insert(serviceRequestAnswersTable).values(answersData);
      }

      await tx.insert(activityLogs).values({
        requestId: createdRequest.id,
        actorId: userId,
        action: "request_created",
        notes: "Pengajuan baru dibuat oleh pemohon.",
      });

      return createdRequest;
    });

    // Handle Uploads
    await this.handleUploads({
      formData,
      requirements,
      userId,
      fullName: userProfile?.fullName || "User",
      requestId: result.id,
      requestNumber: result.requestNumber,
    });

    // Notification: New request created
    await NotificationService.create({
      type: "info",
      title: "Pengajuan Baru Masuk",
      message: `${userProfile?.fullName || "Pemohon"} mengajukan permohonan baru (${result.requestNumber}).`,
      link: `/admin/pengajuan/${result.id}`,
    });

    return result;
  }

  /**
   * Update an existing request by an applicant (for revisions)
   */
  static async updateByApplicant(params: {
    requestId: string;
    userId: string;
    formData: FormData;
  }) {
    const { requestId, userId, formData } = params;

    const request = await db.query.serviceRequests.findFirst({
      where: and(eq(serviceRequests.id, requestId), eq(serviceRequests.userId, userId)),
    });

    if (!request) throw new Error("Pengajuan tidak ditemukan");

    if (!["submitted", "under_review", "revision_required"].includes(request.status)) {
      throw new Error("Status pengajuan saat ini tidak dapat diubah.");
    }

    const answersJson = formData.get("answers") as string;
    const updates = answersJson ? JSON.parse(answersJson) : [];

    const [requirements, userProfile] = await Promise.all([
      db.query.serviceRequirements.findMany({
        where: eq(serviceRequirementsTable.serviceItemId, request.serviceItemId),
      }),
      db.query.profiles.findFirst({
        where: eq(profilesTable.id, userId),
        columns: { fullName: true },
      }),
    ]);

    await db.transaction(async (tx) => {
      // 1. Update text answers
      for (const update of updates as any[]) {
        await tx
          .update(serviceRequestAnswersTable)
          .set({ fieldValue: update.fieldValue, updatedAt: new Date() })
          .where(
            and(
              eq(serviceRequestAnswersTable.id, BigInt(update.id)),
              eq(serviceRequestAnswersTable.requestId, requestId),
            ),
          );
      }

      // 2. Log activity
      await tx.insert(activityLogs).values({
        requestId: requestId,
        actorId: userId,
        action: "request_updated",
        notes: "Pemohon memperbarui data dan dokumen pengajuan.",
      });
    });

    // 3. Handle uploads
    await this.handleUploads({
      formData,
      requirements,
      userId,
      fullName: userProfile?.fullName || "User",
      requestId: request.id,
      requestNumber: request.requestNumber,
    });

    return { success: true };
  }

  /**
   * Delete a request by an applicant
   */
  static async deleteByApplicant(requestId: string, userId: string) {
    const request = await db.query.serviceRequests.findFirst({
      where: and(eq(serviceRequests.id, requestId), eq(serviceRequests.userId, userId)),
      columns: { id: true, status: true },
    });

    if (!request) throw new Error("Pengajuan tidak ditemukan");

    if (!["submitted", "under_review", "revision_required"].includes(request.status)) {
      throw new Error("Pengajuan yang sudah diproses tidak dapat dihapus.");
    }

    // Get all document paths
    const docs = await db.query.serviceRequestDocuments.findMany({
      where: eq(serviceRequestDocuments.requestId, requestId),
      columns: { filePath: true },
    });

    // Cleanup files
    for (const doc of docs) {
      if (!doc.filePath) continue;
      if (doc.filePath.startsWith("r2:")) {
        await deleteFromR2(doc.filePath).catch(() => {});
      } else {
        const admin = createAdminClient();
        await admin.storage.from("request-documents").remove([doc.filePath]).catch(() => {});
      }
    }

    // Delete from DB
    await db.delete(serviceRequests).where(eq(serviceRequests.id, requestId));
  }

  /**
   * Internal helper to handle R2 & GDrive uploads
   */
  private static async handleUploads({
    formData,
    requirements,
    userId,
    fullName,
    requestId,
    requestNumber,
  }: {
    formData: FormData;
    requirements: any[];
    userId: string;
    fullName: string;
    requestId: string;
    requestNumber: string;
  }) {
    const safeUserName = sanitizeFilename(fullName || "User").replace(/\s+/g, "_");

    function isAllowedExtension(fileName: string, allowedExtensions: string) {
      const extension = fileName.split(".").pop()?.toLowerCase() || "";
      const allowed = allowedExtensions
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean);
      return allowed.includes(extension);
    }

    const uploadPromises = (requirements ?? []).map(async (requirement) => {
      const file = formData.get(`requirement_${requirement.id}`) as File | null;
      if (!file || file.size === 0) return;

      // Validasi file extension berdasarkan konfigurasi requirement
      const allowedExts = requirement.allowedExtensions || "pdf,jpg,jpeg,png";
      if (!isAllowedExtension(file.name, allowedExts)) {
        throw new Error(`Format file untuk "${requirement.documentName}" tidak diizinkan. Diperbolehkan: ${allowedExts}.`);
      }

      // Validasi ukuran file
      const maxSize = (Number(requirement.maxFileSizeMb) || 5) * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error(`Ukuran file untuk "${requirement.documentName}" melebihi batas ${requirement.maxFileSizeMb || 5} MB.`);
      }

      const originalFileName = sanitizeFilename(file.name);
      const safeReqName = sanitizeFilename(requirement.documentName).replace(/\s+/g, "_");
      const finalFileName = `${safeReqName}_${originalFileName}`;

      // Upload to Cloudflare R2
      const r2Path = `requests/${safeUserName}_${userId.substring(0, 5)}/${requestNumber}/${finalFileName}`;
      const { path: storagePath } = await uploadToR2(file, r2Path);

      // Dual-Storage: Upload backup to Google Drive
      const gdrivePath = `requests/${safeUserName}_${userId.substring(0, 5)}/${requestNumber}`;
      try {
        await uploadToGoogleDrive(file, gdrivePath);
      } catch (gdriveError) {
        console.error("Google Drive backup failed for request document:", gdriveError);
      }

      // DB Sync
      await db
        .insert(serviceRequestDocuments)
        .values({
          requestId,
          requirementId: requirement.id,
          fileName: finalFileName,
          filePath: storagePath || "",
          fileType: file.type || "application/octet-stream",
          fileSize: BigInt(file.size),
        })
        .onConflictDoUpdate({
          target: [serviceRequestDocuments.requestId, serviceRequestDocuments.requirementId],
          set: {
            fileName: finalFileName,
            filePath: storagePath || "",
            fileType: file.type || "application/octet-stream",
            fileSize: BigInt(file.size),
            updatedAt: new Date(),
          },
        });
    });

    await Promise.all(uploadPromises);
  }
}
