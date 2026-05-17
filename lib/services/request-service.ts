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
import { serviceFormFields as serviceFormFieldsTable, serviceRequirements as serviceRequirementsTable, serviceRequestAnswers as serviceRequestAnswersTable, profiles as profilesTable, services as servicesTable } from "@/lib/db/schema";
import { and, asc, desc, ilike, or, sql } from "drizzle-orm";
import { sanitizeFilename } from "@/lib/utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { NotificationService } from "./notification-service";

export class RequestService {
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

      // Create Real Notification for Admins/Users
      await NotificationService.create({
        type: newStatus === "rejected" || newStatus === "spam" ? "error" : "success",
        title: `Status Pengajuan Berubah`,
        message: `Pengajuan dengan ID ${requestId.slice(-8).toUpperCase()} telah diupdate menjadi ${newStatus.replace("_", " ")}.`,
        link: `/admin/pengajuan/${requestId}`,
      });
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
      with: { profiles: true },
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
        type: "success",
        title: "Dokumen Hasil Diunggah",
        message: `Dokumen hasil "${fileName}" telah diunggah untuk pengajuan ${request.requestNumber}.`,
        link: `/admin/pengajuan/${requestId}`,
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

    // 3. Handle uploads (re-uses handleUploads logic with onConflictDoUpdate)
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
   * Internal helper to handle R2 uploads
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

    const uploadPromises = (requirements ?? []).map(async (requirement) => {
      const file = formData.get(`requirement_${requirement.id}`) as File | null;
      if (!file || file.size === 0) return;

      const originalFileName = sanitizeFilename(file.name);
      const safeReqName = sanitizeFilename(requirement.documentName).replace(/\s+/g, "_");
      const finalFileName = `${safeReqName}_${originalFileName}`;

      // Upload to Cloudflare R2
      const r2Path = `requests/${safeUserName}_${userId.substring(0, 5)}/${requestNumber}/${finalFileName}`;
      const { path: storagePath } = await uploadToR2(file, r2Path);

      // 3. DB Sync
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

  /**
   * Get paginated requests for Admin view
   */
  static async getPaginatedRequests(params: {
    page: number;
    pageSize: number;
    status?: string;
    q?: string;
    serviceId?: string;
    roleOwner?: string;
  }) {
    const { page, pageSize, status, q, serviceId, roleOwner } = params;
    const offset = (page - 1) * pageSize;

    const filters = [];
    if (status) filters.push(eq(serviceRequests.status, status as any));
    if (serviceId) filters.push(eq(serviceRequests.serviceId, BigInt(serviceId)));
    if (roleOwner) {
      filters.push(
        sql`EXISTS (SELECT 1 FROM ${servicesTable} WHERE ${servicesTable.id} = ${serviceRequests.serviceId} AND ${servicesTable.roleOwner} = ${roleOwner})`
      );
    }
    if (q) {
      filters.push(
        or(
          ilike(serviceRequests.requestNumber, `%${q}%`),
          sql`EXISTS (SELECT 1 FROM ${profilesTable} WHERE ${profilesTable.id} = ${serviceRequests.userId} AND (${ilike(profilesTable.fullName, `%${q}%`)} OR ${ilike(profilesTable.email, `%${q}%`)}))`
        )
      );
    }

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const [data, [{ count }]] = await Promise.all([
      db.query.serviceRequests.findMany({
        where: whereClause,
        with: {
          profiles: { columns: { fullName: true, email: true } },
          services: { columns: { name: true } },
          serviceItems: { columns: { name: true } },
        },
        orderBy: [desc(serviceRequests.createdAt)],
        limit: pageSize,
        offset: offset,
      }),
      db.select({ count: sql<number>`count(*)` }).from(serviceRequests).where(whereClause),
    ]);

    return {
      data,
      totalCount: Number(count),
      totalPages: Math.ceil(Number(count) / pageSize),
    };
  }

  /**
   * Global search for Command Palette
   */
  static async searchGlobal(query: string) {
    if (!query || query.length < 2) return { requests: [], profiles: [] };

    const searchStr = `%${query}%`;

    // 1. Search Requests
    const requests = await db
      .select({
        id: serviceRequests.id,
        requestNumber: serviceRequests.requestNumber,
        status: serviceRequests.status,
        serviceName: servicesTable.name,
      })
      .from(serviceRequests)
      .leftJoin(servicesTable, eq(serviceRequests.serviceId, servicesTable.id))
      .where(
        or(
          ilike(serviceRequests.requestNumber, searchStr),
          ilike(servicesTable.name, searchStr)
        )
      )
      .limit(5);

    // 2. Search Profiles
    const profiles = await db
      .select({
        id: profilesTable.id,
        fullName: profilesTable.fullName,
        email: profilesTable.email,
        role: profilesTable.role,
      })
      .from(profilesTable)
      .where(
        or(
          ilike(profilesTable.fullName, searchStr),
          ilike(profilesTable.email, searchStr)
        )
      )
      .limit(5);

    return { requests, profiles };
  }
}
