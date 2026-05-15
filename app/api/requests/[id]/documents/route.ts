export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { sanitizeFilename } from "@/lib/utils";
import {
  getOrCreateFolder,
  uploadToDrive,
  deleteFromDrive,
} from "@/lib/google-drive";
import { uploadToR2, deleteFromR2 } from "@/lib/r2";

function isAllowedExtension(fileName: string, allowedExtensions: string) {
  const extension = fileName.split(".").pop()?.toLowerCase() || "";
  const allowed = allowedExtensions
    .split(",")
    .map((item: string) => item.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(extension);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const requestId = id;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const serviceRequest = await prisma.service_requests.findUnique({
    where: {
      id: requestId,
      user_id: user.id,
    },
  });

  if (!serviceRequest) {
    return NextResponse.json(
      { error: "Pengajuan tidak ditemukan." },
      { status: 404 },
    );
  }

  const formData = await request.formData();
  const requirementId = BigInt(formData.get("requirement_id") as string);
  const file = formData.get("file") as File | null;

  if (!requirementId || !file || file.size === 0) {
    return NextResponse.json(
      { error: "Dokumen revisi tidak valid." },
      { status: 400 },
    );
  }

  const requirement = await prisma.service_requirements.findUnique({
    where: { id: requirementId },
  });

  if (!requirement) {
    return NextResponse.json(
      { error: "Persyaratan dokumen tidak ditemukan." },
      { status: 404 },
    );
  }

  if (file.size > (Number(requirement.max_file_size_mb) || 5) * 1024 * 1024) {
    return NextResponse.json(
      { error: "Ukuran file melebihi batas." },
      { status: 400 },
    );
  }

  if (
    !isAllowedExtension(
      file.name,
      requirement.allowed_extensions || "pdf,jpg,jpeg,png",
    )
  ) {
    return NextResponse.json(
      { error: "Format file tidak diizinkan." },
      { status: 400 },
    );
  }

  const fileName = sanitizeFilename(file.name);

  // 1. Get or create the main "File Persyaratan" folder
  const mainRequirementsFolderId = await getOrCreateFolder("File Persyaratan");

  // 2. Get user info to create a subfolder (Name - Email)
  const userProfile = await prisma.profiles.findUnique({
    where: { id: user.id },
    select: { full_name: true, email: true },
  });

  const userFolderName = `${userProfile?.full_name || "Unknown User"} (${userProfile?.email || user.email})`;
  const userFolderId = await getOrCreateFolder(
    userFolderName,
    mainRequirementsFolderId as string,
  );

  // 3. Check for existing document to delete from Cloudflare R2 or Google Drive
  const existingDoc = await prisma.service_request_documents.findUnique({
    where: {
      request_id_requirement_id: {
        request_id: requestId,
        requirement_id: requirementId,
      },
    },
    select: { file_path: true },
  });

  if (existingDoc?.file_path) {
    if (existingDoc.file_path.startsWith("r2:")) {
      await deleteFromR2(existingDoc.file_path).catch(console.error);
    } else if (existingDoc.file_path.startsWith("gdrive:")) {
      const oldFileId = existingDoc.file_path.replace("gdrive:", "");
      await deleteFromDrive(oldFileId).catch(console.error);
    }
  }

  // 4. Upload to Cloudflare R2 (Primary)
  const r2Path = `requests/${requestId}/${requirementId}_${fileName}`;
  const { path: storagePath } = await uploadToR2(file, r2Path);

  // 5. Backup to Google Drive (Background)
  uploadToDrive(file, userFolderId as string).catch((err) =>
    console.error("Backup to GDrive failed:", err),
  );

  try {
    await prisma.$transaction(async (tx) => {
      await tx.service_request_documents.upsert({
        where: {
          request_id_requirement_id: {
            request_id: requestId,
            requirement_id: requirementId,
          },
        },
        update: {
          file_name: fileName,
          file_path: storagePath,
          file_type: file.type || "application/octet-stream",
          file_size: BigInt(file.size),
        },
        create: {
          request_id: requestId,
          requirement_id: requirementId,
          file_name: fileName,
          file_path: storagePath,
          file_type: file.type || "application/octet-stream",
          file_size: BigInt(file.size),
        },
      });

      await tx.service_requests.update({
        where: { id: requestId },
        data: {
          status: "submitted",
          revision_note: null,
        },
      });

      await tx.activity_logs.create({
        data: {
          request_id: requestId,
          actor_id: user.id,
          action: "revision_uploaded",
          notes: `Revisi dokumen ${requirement.document_name} diupload.`,
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating documents:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memperbarui dokumen." },
      { status: 500 },
    );
  }
}
