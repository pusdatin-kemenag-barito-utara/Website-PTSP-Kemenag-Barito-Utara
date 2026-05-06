export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sanitizeFilename } from "@/lib/utils";

function isAllowedExtension(fileName: string, allowedExtensions: string) {
  const extension = fileName.split(".").pop()?.toLowerCase() || "";
  const allowed = allowedExtensions
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(extension);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: serviceRequest } = await admin
    .from("service_requests")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!serviceRequest) {
    return NextResponse.json(
      { error: "Pengajuan tidak ditemukan." },
      { status: 404 },
    );
  }

  const formData = await request.formData();
  const requirementId = Number(formData.get("requirement_id"));
  const file = formData.get("file") as File | null;

  if (!requirementId || !file || file.size === 0) {
    return NextResponse.json(
      { error: "Dokumen revisi tidak valid." },
      { status: 400 },
    );
  }

  const { data: requirement } = await admin
    .from("service_requirements")
    .select("*")
    .eq("id", requirementId)
    .maybeSingle();

  if (!requirement) {
    return NextResponse.json(
      { error: "Persyaratan dokumen tidak ditemukan." },
      { status: 404 },
    );
  }

  if (file.size > (requirement.max_file_size_mb || 5) * 1024 * 1024) {
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
  const { getOrCreateFolder, uploadToDrive, deleteFromDrive } =
    await import("@/lib/google-drive");
  const mainRequirementsFolderId = await getOrCreateFolder("File Persyaratan");

  // 2. Get user info to create a subfolder (Name - Email)
  const { data: userProfile } = await admin
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single();

  const userFolderName = `${userProfile?.full_name || "Unknown User"} (${userProfile?.email || user.email})`;
  const userFolderId = await getOrCreateFolder(
    userFolderName,
    mainRequirementsFolderId as string,
  );

  // 3. Check for existing document to delete from Google Drive if it was a revision
  const { data: existingDoc } = await admin
    .from("service_request_documents")
    .select("file_path")
    .eq("request_id", id)
    .eq("requirement_id", requirementId)
    .maybeSingle();

  if (existingDoc?.file_path?.startsWith("gdrive:")) {
    const oldFileId = existingDoc.file_path.replace("gdrive:", "");
    await deleteFromDrive(oldFileId);
  }

  // 4. Upload to the specific user subfolder in Google Drive
  const driveFile = await uploadToDrive(file, userFolderId as string);
  const storagePath = `gdrive:${driveFile.id}`;

  if (!driveFile.id) {
    return NextResponse.json(
      { error: "Gagal mengunggah ke Google Drive." },
      { status: 500 },
    );
  }

  await admin.from("service_request_documents").upsert(
    {
      request_id: id,
      requirement_id: requirementId,
      file_name: fileName,
      file_path: storagePath,
      file_type: file.type || "application/octet-stream",
      file_size: file.size,
    },
    { onConflict: "request_id,requirement_id" },
  );

  await admin
    .from("service_requests")
    .update({
      status: "submitted",
      revision_note: null,
    })
    .eq("id", id);

  await admin.from("activity_logs").insert({
    request_id: id,
    actor_id: user.id,
    action: "revision_uploaded",
    notes: `Revisi dokumen ${requirement.document_name} diupload.`,
  });

  return NextResponse.json({ success: true });
}
