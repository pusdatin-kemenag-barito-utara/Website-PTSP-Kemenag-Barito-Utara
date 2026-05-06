"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadToDrive } from "@/lib/google-drive";

export async function updateRequestStatusAction(formData: FormData) {
  const adminProfile = await requireAdmin();
  const admin = createAdminClient();

  const requestId = String(formData.get("request_id"));
  const newStatus = String(formData.get("status"));
  const notes = String(formData.get("notes") || "");

  const patch: Record<string, string | null> = { status: newStatus };

  if (newStatus === "revision_required") {
    patch.revision_note = notes || null;
  } else {
    patch.revision_note = null;
  }

  if (newStatus === "rejected") {
    patch.rejection_reason = notes || null;
    patch.rejected_at = new Date().toISOString();
  } else {
    patch.rejection_reason = null;
  }

  if (newStatus === "approved") {
    patch.approved_at = new Date().toISOString();
  }

  if (newStatus === "completed") {
    patch.completed_at = new Date().toISOString();
  }

  await admin.from("service_requests").update(patch).eq("id", requestId);

  const actionMap: Record<string, string> = {
    under_review: "status:under_review",
    revision_required: "status:revision_required",
    rejected: "status:rejected",
    approved: "status:approved",
    completed: "status:completed",
  };

  await admin.from("activity_logs").insert({
    request_id: requestId,
    action: actionMap[newStatus],
    notes: notes || null,
    user_id: adminProfile.id,
  });

  revalidatePath(`/admin/pengajuan/${requestId}`);
  revalidatePath("/admin/pengajuan");
}

export async function uploadResultDocumentAction(formData: FormData) {
  const adminProfile = await requireAdmin();
  const admin = createAdminClient();

  const requestId = String(formData.get("request_id"));
  const file = formData.get("file") as File | null;

  if (!requestId || !file || file.size === 0) {
    throw new Error("File tidak valid atau kosong");
  }

  const { data: request } = await admin
    .from("service_requests")
    .select("id, user_id, request_number, status, completed_at")
    .eq("id", requestId)
    .single();

  if (!request) {
    throw new Error("Pengajuan tidak ditemukan");
  }

  const fileExt = file.name.split(".").pop() || "pdf";
  const fileName = `${request.request_number}_MANUAL.${fileExt}`;

  // Check for existing document to delete from Google Drive if it exists
  const { data: existingDoc } = await admin
    .from("generated_documents")
    .select("file_path")
    .eq("request_id", request.id)
    .maybeSingle();

  if (existingDoc?.file_path?.startsWith("gdrive:")) {
    const oldFileId = existingDoc.file_path.replace("gdrive:", "");
    const { deleteFromDrive } = await import("@/lib/google-drive");
    await deleteFromDrive(oldFileId);
  }

  // Upload to Google Drive instead of Supabase
  const driveFile = await uploadToDrive(file);
  const filePath = `gdrive:${driveFile.id}`;

  if (!driveFile.id) {
    throw new Error(`Gagal mengunggah file ke Google Drive`);
  }

  // Delete any existing generated document for this request (including old Supabase ones)
  await admin.from("generated_documents").delete().eq("request_id", request.id);

  // Insert the new Google Drive document
  await admin.from("generated_documents").insert({
    request_id: request.id,
    file_name: fileName,
    file_path: filePath,
    generated_by: adminProfile.id,
    generated_at: new Date().toISOString(),
  });

  const nextStatus = ["approved", "completed"].includes(request.status)
    ? "completed"
    : request.status;

  if (request.status !== nextStatus) {
    await admin
      .from("service_requests")
      .update({
        status: nextStatus,
        completed_at:
          nextStatus === "completed"
            ? new Date().toISOString()
            : request.completed_at,
      })
      .eq("id", request.id);
  }

  await admin.from("activity_logs").insert({
    request_id: request.id,
    action: "manual_document_uploaded",
    notes: "Dokumen hasil diunggah secara manual oleh admin.",
    user_id: adminProfile.id,
  });

  revalidatePath(`/admin/pengajuan/${requestId}`);
  revalidatePath(`/admin/dokumen-hasil`);
  revalidatePath(`/dashboard/pengajuan/${requestId}`);
}

export async function deleteRequestAction(formData: FormData) {
  const adminProfile = await requireAdmin();
  const admin = createAdminClient();
  const requestId = String(formData.get("request_id"));

  if (!requestId) {
    throw new Error("ID Pengajuan tidak valid");
  }

  // 1. Get all associated files from Google Drive
  const [{ data: reqDocs }, { data: genDocs }] = await Promise.all([
    admin
      .from("service_request_documents")
      .select("file_path")
      .eq("request_id", requestId),
    admin
      .from("generated_documents")
      .select("file_path")
      .eq("request_id", requestId),
  ]);

  // 2. Delete files from Google Drive
  const { deleteFromDrive } = await import("@/lib/google-drive");

  const allFilePaths = [
    ...(reqDocs || []).map((d) => d.file_path),
    ...(genDocs || []).map((d) => d.file_path),
  ];

  for (const path of allFilePaths) {
    if (path?.startsWith("gdrive:")) {
      const fileId = path.replace("gdrive:", "");
      await deleteFromDrive(fileId);
    }
  }

  // 3. Delete from database
  const { error } = await admin
    .from("service_requests")
    .delete()
    .eq("id", requestId);

  if (error) {
    throw new Error(`Gagal menghapus pengajuan: ${error.message}`);
  }

  revalidatePath("/admin/pengajuan");
  revalidatePath("/admin/dokumen-hasil");
  redirect("/admin/pengajuan");
}
