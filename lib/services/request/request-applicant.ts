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
  profilesPegawai as profilesPegawaiTable,
  serviceItems as serviceItemsTable,
} from "@/lib/db/schema";
import { pengajuanCuti } from "@/lib/db/schema/kepegawaian";
import { sanitizeFilename } from "@/lib/utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteFromR2, uploadToR2 } from "@/lib/r2";
import { NotificationService } from "../notification-service";
import { uploadToGoogleDrive } from "@/lib/google-drive";
import { sendWhatsAppNotification } from "@/lib/whatsapp";
import {
  generateRequestNumber,
  recycleRequestNumber,
} from "@/lib/request-number";

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

    const [fields, requirements, userProfile, profilePegawai] = await Promise.all([
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
        columns: { fullName: true, phone: true },
      }),
      db.query.profilesPegawai.findFirst({
        where: eq(profilesPegawaiTable.profileId, userId),
        columns: { unitKerja: true },
      }),
    ]);

    // Dapatkan info service untuk penomoran
    const serviceInfo = await db.query.serviceItems.findFirst({
      where: eq(serviceItemsTable.id, serviceItemId),
      with: { service: { columns: { name: true } } },
    });
    const serviceName = serviceInfo?.service?.name || "Layanan PTSP";

    // Generate nomor pengajuan yang bermakna (ASN-CUT-2026-000001 dll)
    const requestNumber = await generateRequestNumber(serviceName);

    // Jika ini layanan cuti, siapkan data untuk tabel pengajuanCuti
    const isCutiService = serviceName?.toLowerCase().includes("cuti") || false;
    let cutiInsertData: any = null;

    if (isCutiService) {
      const unitKerjaForm = (formData.get("unitKerja") as string) || "";
      const jenisPegawai = (formData.get("cuti_jenis_pegawai") as string) || "";

      const findFieldValue = (keywords: string[], matchAll = false) => {
        const field = fields.find((f) => {
          const label = (f.label || "").toLowerCase();
          return matchAll
            ? keywords.every((k) => label.includes(k.toLowerCase()))
            : keywords.some((k) => label.includes(k.toLowerCase()));
        });
        return field ? ((formData.get(`answer_${field.id}`) as string) || "") : "";
      };

      const jenisCuti = serviceInfo?.name || findFieldValue(["jenis cuti"]) || "";
      const alasan = findFieldValue(["alasan"]) || "";

      let tanggalMulai = "";
      let tanggalSelesai = "";
      let tanggalPilihan = "";

      const dateField = fields.find(
        (f) => f.type === "date" && f.label.toLowerCase().includes("tanggal"),
      );
      if (dateField) {
        const rawDate = (formData.get(`answer_${dateField.id}`) as string) || "";
        if (rawDate.includes(",")) {
          const dates = rawDate.split(",").filter(Boolean);
          tanggalMulai = dates[0] || "";
          tanggalSelesai = dates[dates.length - 1] || "";
          tanggalPilihan = rawDate;
        } else {
          tanggalMulai = rawDate;
          tanggalSelesai = rawDate;
        }
      }

      const alamatCuti = findFieldValue(["alamat"]) || "";
      const noHp =
        findFieldValue(["whatsapp", "hp"]) || userProfile?.phone || "";
      const masaKerjaTahun = findFieldValue(["masa kerja", "tahun"], true);
      const masaKerjaBulan = findFieldValue(["masa kerja", "bulan"], true);

      cutiInsertData = {
        userId,
        unitKerja: unitKerjaForm || profilePegawai?.unitKerja || "",
        jenisCuti,
        tanggalMulai,
        tanggalSelesai,
        tanggalPilihan: tanggalPilihan || null,
        alasan,
        jenisPegawai: jenisPegawai || null,
        masaKerjaTahun: masaKerjaTahun || null,
        masaKerjaBulan: masaKerjaBulan || null,
        noHp: noHp || null,
        alamatCuti: alamatCuti || null,
        ttdPemohon: "TTE_VERIFIED",
        statusAtasan: "pending",
        statusKepala: "pending",
        status: "pending",
      };
    }

    // Create Request in Transaction
    const result = await db.transaction(async (tx) => {
      const [createdRequest] = await tx
        .insert(serviceRequests)
        .values({
          userId: userId,
          serviceId: serviceId,
          serviceItemId: serviceItemId,
          requestNumber,
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

      if (cutiInsertData) {
        await tx.insert(pengajuanCuti).values(cutiInsertData);
      }

      return createdRequest;
    });

    // Handle Uploads
    await RequestApplicantService.handleUploads({
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

    // Trigger Webhook ke n8n untuk Notifikasi WA User
    try {
      const webhookUrl = process.env.N8N_NEW_REQUEST_WEBHOOK_URL;
      if (webhookUrl && userProfile?.phone) {
        const itemInfo = await db.query.serviceItems.findFirst({
          where: eq(serviceItemsTable.id, serviceItemId),
          with: { service: true },
        });

        fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ticketNumber: result.requestNumber,
            userName: userProfile.fullName || "Pemohon",
            userPhone: userProfile.phone,
            serviceName: itemInfo?.service?.name || "Layanan PTSP",
            serviceItemName: itemInfo?.name || "Item Layanan",
            submittedAt: new Date().toISOString(),
          }),
        }).catch((err) => console.error("Webhook n8n fetch error:", err)); // Fire and forget
      }
    } catch (e) {
      console.error("Failed to prepare webhook to n8n:", e);
    }

    // Notifikasi WA langsung ke pegawai setelah pengajuan berhasil
    try {
      // Coba ambil nomor WA dari jawaban form (field no_whatsapp / No. WhatsApp) — khusus form cuti
      const waFromForm =
        (formData.get("answer_no_whatsapp") as string) ||
        (Array.from(formData.entries()).find(
          ([k]) =>
            k.startsWith("answer_") &&
            formData.get(k)?.toString().startsWith("08"),
        )?.[1] as string) ||
        "";

      const targetPhone =
        waFromForm?.replace(/\D/g, "") ||
        userProfile?.phone?.replace(/\D/g, "") ||
        "";

      const itemInfo = await db.query.serviceItems.findFirst({
        where: eq(serviceItemsTable.id, serviceItemId),
        with: { service: true },
      });

      const namaLayanan =
        itemInfo?.name || itemInfo?.service?.name || "Layanan";

      if (targetPhone && targetPhone.length >= 9) {
        const tanggalKirim = new Intl.DateTimeFormat("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Jakarta",
        }).format(new Date());

        const pesanWA = [
          `✅ *Pengajuan Berhasil Diterima*`,
          ``,
          `Halo *${userProfile?.fullName || "Pegawai"}*,`,
          `Pengajuan Anda telah berhasil dikirimkan ke sistem PTSP Kemenag Barito Utara.`,
          ``,
          `📋 *Detail Pengajuan:*`,
          `• Nomor Tiket : *${result.requestNumber}*`,
          `• Layanan: *${namaLayanan}*`,
          `• Waktu Kirim: ${tanggalKirim} WIB`,
          ``,
          `🔍 *Lacak Pengajuan Anda*`,
          `Pantau status pengajuan Anda secara real-time dengan menekan tautan di bawah ini:`,
          `https://ptsp.kemenag-baritoutara.com/track?q=${result.requestNumber}`,
          ``,
          `⏳ Pengajuan Anda sedang dalam proses peninjauan. Anda akan mendapat notifikasi kembali setelah ada pembaruan status.`,
          ``,
          `_Pesan ini dikirim otomatis oleh Sistem PTSP Kemenag Barito Utara._`,
        ].join("\n");

        sendWhatsAppNotification(targetPhone, pesanWA).catch((err) =>
          console.error("[WA Bot] Gagal kirim notifikasi pengajuan cuti:", err),
        );
      }
    } catch (e) {
      console.error(
        "[WA Bot] Error saat menyiapkan notifikasi WA pengajuan:",
        e,
      );
    }

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
      where: and(
        eq(serviceRequests.id, requestId),
        eq(serviceRequests.userId, userId),
      ),
    });

    if (!request) throw new Error("Pengajuan tidak ditemukan");

    if (
      !["submitted", "under_review", "revision_required"].includes(
        request.status,
      )
    ) {
      throw new Error("Status pengajuan saat ini tidak dapat diubah.");
    }

    const answersJson = formData.get("answers") as string;
    const updates = answersJson ? JSON.parse(answersJson) : [];

    const [requirements, userProfile] = await Promise.all([
      db.query.serviceRequirements.findMany({
        where: eq(
          serviceRequirementsTable.serviceItemId,
          request.serviceItemId,
        ),
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

    // Handle Uploads
    await RequestApplicantService.handleUploads({
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
      where: and(
        eq(serviceRequests.id, requestId),
        eq(serviceRequests.userId, userId),
      ),
      columns: { id: true, status: true, requestNumber: true },
    });

    if (!request) throw new Error("Pengajuan tidak ditemukan");

    if (
      !["submitted", "under_review", "revision_required"].includes(
        request.status,
      )
    ) {
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
        await admin.storage
          .from("request-documents")
          .remove([doc.filePath])
          .catch(() => {});
      }
    }

    // Kembalikan nomor pengajuan ke pool daur ulang sebelum dihapus
    await recycleRequestNumber(request.requestNumber).catch(() => {});

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
    const safeUserName = sanitizeFilename(fullName || "User").replace(
      /\s+/g,
      "_",
    );

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
        throw new Error(
          `Format file untuk "${requirement.documentName}" tidak diizinkan. Diperbolehkan: ${allowedExts}.`,
        );
      }

      // Validasi ukuran file
      const maxSize = (Number(requirement.maxFileSizeMb) || 5) * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error(
          `Ukuran file untuk "${requirement.documentName}" melebihi batas ${requirement.maxFileSizeMb || 5} MB.`,
        );
      }

      const originalFileName = sanitizeFilename(file.name);
      const safeReqName = sanitizeFilename(requirement.documentName).replace(
        /\s+/g,
        "_",
      );
      const finalFileName = `${safeReqName}_${originalFileName}`;

      // Upload to Cloudflare R2
      const r2Path = `requests/${safeUserName}_${userId.substring(0, 5)}/${requestNumber}/${finalFileName}`;
      const { path: storagePath } = await uploadToR2(file, r2Path);

      // Dual-Storage: Upload backup to Google Drive
      const gdrivePath = `requests/${safeUserName}_${userId.substring(0, 5)}/${requestNumber}`;
      try {
        await uploadToGoogleDrive(file, gdrivePath);
      } catch (gdriveError) {
        console.error(
          "Google Drive backup failed for request document:",
          gdriveError,
        );
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
          target: [
            serviceRequestDocuments.requestId,
            serviceRequestDocuments.requirementId,
          ],
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
