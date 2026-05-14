"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { uploadToDrive } from "@/lib/google-drive";
import { createAuditLog } from "@/lib/audit";

export async function updateRequestStatusAction(formData: FormData) {
  const adminProfile = await requireAdmin();

  const requestId = String(formData.get("request_id"));
  const newStatus = String(formData.get("status")) as any;
  const notes = String(formData.get("notes") || "");

  const patch: any = { status: newStatus };

  if (newStatus === "revision_required") {
    patch.revision_note = notes || null;
    patch.completed_at = null; // Clear completion date on downgrade
  } else {
    patch.revision_note = null;
  }

  if (newStatus === "rejected") {
    patch.rejection_reason = notes || null;
    patch.rejected_at = new Date();
    patch.completed_at = null;
    patch.approved_at = null;
  } else {
    patch.rejection_reason = null;
  }

  if (newStatus === "approved") {
    patch.approved_at = new Date();
    patch.completed_at = null;
  }

  if (newStatus === "completed") {
    patch.completed_at = new Date();
    // Keep approved_at if it exists
  }

  if (newStatus === "under_review") {
    patch.completed_at = null;
    patch.approved_at = null;
    patch.rejected_at = null;
  }

  const actionMap: Record<string, string> = {
    under_review: "status:under_review",
    revision_required: "status:revision_required",
    rejected: "status:rejected",
    approved: "status:approved",
    completed: "status:completed",
  };

  await prisma.$transaction([
    prisma.service_requests.update({
      where: { id: requestId },
      data: patch,
    }),
    prisma.activity_logs.create({
      data: {
        request_id: requestId,
        action: actionMap[newStatus] || `status:${newStatus}`,
        notes: notes || null,
        actor_id: adminProfile.id,
      },
    }),
  ]);

  // Log to System Audit
  await createAuditLog({
    adminId: adminProfile.id,
    action: `merubah_status_${newStatus}`,
    entityType: "service_request",
    entityId: requestId,
    details: {
      status_sebelumnya: "unknown", // Idealnya ambil dulu data lama, tapi untuk sekarang simple saja
      catatan: notes,
    },
  });

  revalidatePath(`/admin/pengajuan/${requestId}`);
  revalidatePath("/admin/pengajuan");
  revalidatePath("/track");
  revalidatePath("/");
}

export async function uploadResultDocumentAction(formData: FormData) {
  const adminProfile = await requireAdmin();

  const requestId = String(formData.get("request_id"));
  const file = formData.get("file") as File | null;

  if (!requestId || !file || file.size === 0) {
    throw new Error("File tidak valid atau kosong");
  }

  const request = await prisma.service_requests.findUnique({
    where: { id: requestId },
    select: { id: true, user_id: true, request_number: true, status: true, completed_at: true },
  });

  if (!request) {
    throw new Error("Pengajuan tidak ditemukan");
  }

  const fileExt = file.name.split(".").pop() || "pdf";
  const fileName = `${request.request_number}_MANUAL.${fileExt}`;

  // Check for existing document to delete from Google Drive if it exists
  const existingDoc = await prisma.generated_documents.findUnique({
    where: { request_id: request.id },
    select: { file_path: true },
  });

  if (existingDoc?.file_path?.startsWith("gdrive:")) {
    const oldFileId = existingDoc.file_path.replace("gdrive:", "");
    const { deleteFromDrive } = await import("@/lib/google-drive");
    try {
      await deleteFromDrive(oldFileId);
    } catch (err) {
      console.error(`Gagal menghapus file lama dari Drive:`, err);
    }
  }

  // Upload to Cloudflare R2 as primary, Google Drive as backup
  const { uploadToR2 } = await import("@/lib/r2");
  const { uploadToDrive } = await import("@/lib/google-drive");

  const r2Path = `results/${request.request_number}/${fileName}`;

  const [r2Result] = await Promise.all([
    uploadToR2(file, r2Path),
    uploadToDrive(file, undefined, fileName).catch((err) => {
      console.error(`Gagal backup hasil ke Drive:`, err);
    }),
  ]);

  if (!r2Result.path) {
    throw new Error(`Gagal mengunggah file ke Cloudflare R2`);
  }

  const filePath = r2Result.path;

  const nextStatus = ["approved", "completed"].includes(request.status)
    ? "completed"
    : request.status;

  await prisma.$transaction([
    // Delete any existing generated document for this request
    prisma.generated_documents.deleteMany({
      where: { request_id: request.id },
    }),
    // Insert the new Google Drive document
    prisma.generated_documents.create({
      data: {
        request_id: request.id,
        file_name: fileName,
        file_path: filePath,
        generated_by: adminProfile.id,
        generated_at: new Date(),
      },
    }),
    // Update request status if needed
    ...(request.status !== nextStatus 
      ? [prisma.service_requests.update({
          where: { id: request.id },
          data: {
            status: nextStatus as any,
            completed_at: nextStatus === "completed" ? new Date() : request.completed_at,
          }
        })]
      : []),
    // Add activity log
    prisma.activity_logs.create({
      data: {
        request_id: request.id,
        action: "manual_document_uploaded",
        notes: "Dokumen hasil diunggah secara manual oleh admin.",
        actor_id: adminProfile.id,
      }
    })
  ]);

  // Log to System Audit
  await createAuditLog({
    adminId: adminProfile.id,
    action: "unggah_dokumen_hasil",
    entityType: "service_request",
    entityId: requestId,
    details: {
      file_name: fileName,
      status_akhir: nextStatus,
    },
  });

  revalidatePath(`/admin/pengajuan/${requestId}`);
  revalidatePath("/admin/dokumen-hasil");
  revalidatePath(`/dashboard/pengajuan/${requestId}`);
  revalidatePath("/track");
  revalidatePath("/");
}

export async function deleteRequestAction(formData: FormData) {
  await requireAdmin();
  const requestId = String(formData.get("request_id"));

  if (!requestId) {
    throw new Error("ID Pengajuan tidak valid");
  }

  // 1. Get all associated files from Google Drive
  const [reqDocs, genDocs] = await Promise.all([
    prisma.service_request_documents.findMany({
      where: { request_id: requestId },
      select: { file_path: true },
    }),
    prisma.generated_documents.findUnique({
      where: { request_id: requestId },
      select: { file_path: true },
    }),
  ]);

  // 2. Delete files from Google Drive and Cloudflare R2
  const { deleteFromDrive } = await import("@/lib/google-drive");
  const { deleteFromR2 } = await import("@/lib/r2");

  const allFilePaths = [
    ...reqDocs.map((d) => d.file_path),
    ...(genDocs ? [genDocs.file_path] : []),
  ];

  for (const path of allFilePaths) {
    if (!path) continue;
    
    if (path.startsWith("gdrive:")) {
      const fileId = path.replace("gdrive:", "");
      try {
        await deleteFromDrive(fileId);
      } catch (err) {
        console.error(`Gagal menghapus file Drive ${fileId}:`, err);
      }
    } else if (path.startsWith("r2:")) {
      try {
        await deleteFromR2(path);
      } catch (err) {
        console.error(`Gagal menghapus file R2 ${path}:`, err);
      }
    }
  }

  // 3. Delete from database (Prisma handles relations based on schema onDelete: Cascade)
  await prisma.service_requests.delete({
    where: { id: requestId },
  });

  // Log to System Audit
  await createAuditLog({
    adminId: (await requireAdmin()).id,
    action: "hapus_pengajuan",
    entityType: "service_request",
    entityId: requestId,
  });

  revalidatePath("/admin/pengajuan");
  revalidatePath("/admin/dokumen-hasil");
  revalidatePath("/track");
  revalidatePath("/");
  redirect("/admin/pengajuan");
}

export async function deleteActivityLogAction(formData: FormData) {
  await requireAdmin();
  const logId = String(formData.get("log_id"));
  const requestId = String(formData.get("request_id"));

  if (!logId) throw new Error("ID log tidak valid");

  await prisma.activity_logs.delete({
    where: { id: BigInt(logId) },
  });

  revalidatePath(`/admin/pengajuan/${requestId}`);
  revalidatePath("/track");
  revalidatePath("/");
}

export async function updateActivityLogAction(formData: FormData) {
  await requireAdmin();
  const logId = String(formData.get("log_id"));
  const requestId = String(formData.get("request_id"));
  const notes = String(formData.get("notes") || "");

  if (!logId) throw new Error("ID log tidak valid");

  await prisma.activity_logs.update({
    where: { id: BigInt(logId) },
    data: { notes },
  });

  revalidatePath(`/admin/pengajuan/${requestId}`);
  revalidatePath("/track");
  revalidatePath("/");
}
