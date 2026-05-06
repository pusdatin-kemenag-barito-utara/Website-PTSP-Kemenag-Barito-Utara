export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sanitizeFilename } from "@/lib/utils";
import { uploadToDrive } from "@/lib/google-drive";

const MAX_DEFAULT_FILE_SIZE = 5 * 1024 * 1024;

function isAllowedExtension(fileName: string, allowedExtensions: string) {
  const extension = fileName.split(".").pop()?.toLowerCase() || "";
  const allowed = allowedExtensions
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(extension);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const serviceId = Number(formData.get("service_id"));
  const serviceItemId = Number(formData.get("service_item_id"));

  if (!serviceId || !serviceItemId) {
    return NextResponse.json(
      { error: "Layanan tidak valid." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  const [{ data: fields }, { data: requirements }] = await Promise.all([
    admin
      .from("service_form_fields")
      .select("*")
      .eq("service_item_id", serviceItemId)
      .order("sort_order"),
    admin
      .from("service_requirements")
      .select("*")
      .eq("service_item_id", serviceItemId)
      .order("id"),
  ]);

  for (const requirement of requirements ?? []) {
    const file = formData.get(`requirement_${requirement.id}`) as File | null;
    if (requirement.is_required && (!file || file.size === 0)) {
      return NextResponse.json(
        { error: `Dokumen wajib belum diupload: ${requirement.document_name}` },
        { status: 400 },
      );
    }

    if (file && file.size > (requirement.max_file_size_mb || 5) * 1024 * 1024) {
      return NextResponse.json(
        {
          error: `Ukuran file terlalu besar untuk ${requirement.document_name}`,
        },
        { status: 400 },
      );
    }

    if (
      file &&
      !isAllowedExtension(
        file.name,
        requirement.allowed_extensions || "pdf,jpg,jpeg,png",
      )
    ) {
      return NextResponse.json(
        {
          error: `Format file tidak diizinkan untuk ${requirement.document_name}`,
        },
        { status: 400 },
      );
    }
  }

  const { data: createdRequest, error: createError } = await admin
    .from("service_requests")
    .insert({
      user_id: user.id,
      service_id: serviceId,
      service_item_id: serviceItemId,
      status: "submitted",
      submitted_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (createError || !createdRequest) {
    if (createError?.code === "23505") {
      return NextResponse.json(
        {
          error:
            "Terjadi gangguan sinkronisasi nomor pengajuan. Silakan coba klik Kirim kembali dalam beberapa saat.",
        },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: createError?.message || "Gagal membuat pengajuan." },
      { status: 500 },
    );
  }

  const answers = (fields ?? []).map((field) => ({
    request_id: createdRequest.id,
    field_id: field.id,
    field_name: field.label,
    field_value: String(formData.get(`answer_${field.id}`) || ""),
  }));

  if (answers.length) {
    await admin.from("service_request_answers").insert(answers);
  }

  // 1. Get or create the main "File Persyaratan" folder
  const { getOrCreateFolder } = await import("@/lib/google-drive");
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

  for (const requirement of requirements ?? []) {
    const file = formData.get(`requirement_${requirement.id}`) as File | null;
    if (!file || file.size === 0) continue;

    const fileName = sanitizeFilename(file.name);

    // Upload to the specific user subfolder in Google Drive
    const driveFile = await uploadToDrive(file, userFolderId as string);
    const storagePath = `gdrive:${driveFile.id}`;

    if (!driveFile.id) {
      return NextResponse.json(
        {
          error: `Gagal mengunggah ${requirement.document_name} ke Google Drive`,
        },
        { status: 500 },
      );
    }

    await admin.from("service_request_documents").upsert(
      {
        request_id: createdRequest.id,
        requirement_id: requirement.id,
        file_name: fileName,
        file_path: storagePath,
        file_type: file.type || "application/octet-stream",
        file_size: file.size || MAX_DEFAULT_FILE_SIZE,
      },
      { onConflict: "request_id,requirement_id" },
    );
  }

  await admin.from("activity_logs").insert({
    request_id: createdRequest.id,
    actor_id: user.id,
    action: "request_created",
    notes: "Pengajuan baru dibuat oleh pemohon.",
  });

  return NextResponse.json({ id: createdRequest.id }, { status: 201 });
}
