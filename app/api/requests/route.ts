export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { sanitizeFilename } from "@/lib/utils";
import { uploadToDrive, getOrCreateFolder } from "@/lib/google-drive";
import { uploadToR2 } from "@/lib/r2";

const MAX_DEFAULT_FILE_SIZE = 5 * 1024 * 1024;

function isAllowedExtension(fileName: string, allowedExtensions: string) {
  const extension = fileName.split(".").pop()?.toLowerCase() || "";
  const allowed = allowedExtensions
    .split(",")
    .map((item: string) => item.trim().toLowerCase())
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
  const serviceId = BigInt(formData.get("service_id") as string);
  const serviceItemId = BigInt(formData.get("service_item_id") as string);

  if (!serviceId || !serviceItemId) {
    return NextResponse.json(
      { error: "Layanan tidak valid." },
      { status: 400 },
    );
  }

  const [fields, requirements] = await Promise.all([
    prisma.service_form_fields.findMany({
      where: { service_item_id: serviceItemId },
      orderBy: { sort_order: "asc" },
    }),
    prisma.service_requirements.findMany({
      where: { service_item_id: serviceItemId },
      orderBy: { id: "asc" },
    }),
  ]);

  for (const requirement of requirements ?? []) {
    const file = formData.get(`requirement_${requirement.id}`) as File | null;
    if (requirement.is_required && (!file || file.size === 0)) {
      return NextResponse.json(
        { error: `Dokumen wajib belum diupload: ${requirement.document_name}` },
        { status: 400 },
      );
    }

    if (
      file &&
      file.size > (Number(requirement.max_file_size_mb) || 5) * 1024 * 1024
    ) {
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

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the request
      const createdRequest = await tx.service_requests.create({
        data: {
          user_id: user.id,
          service_id: serviceId,
          service_item_id: serviceItemId,
          status: "submitted",
          submitted_at: new Date(),
        },
      });

      // 2. Save form answers
      const answersData = fields.map((field: any) => ({
        request_id: createdRequest.id,
        field_id: field.id,
        field_name: field.label,
        field_value: String(formData.get(`answer_${field.id}`) || ""),
      }));

      if (answersData.length) {
        await tx.service_request_answers.createMany({
          data: answersData,
        });
      }

      // 3. Create activity log
      await tx.activity_logs.create({
        data: {
          request_id: createdRequest.id,
          actor_id: user.id,
          action: "request_created",
          notes: "Pengajuan baru dibuat oleh pemohon.",
        },
      });

      return createdRequest;
    });

    // 4. Handle Google Drive uploads
    const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    const userProfile = await prisma.profiles.findUnique({
      where: { id: user.id },
      select: { full_name: true, email: true },
    });

    const safeUserName = sanitizeFilename(
      userProfile?.full_name || "User",
    ).replace(/\s+/g, "_");

    // Buat/Cari folder User di dalam folder Utama (PTSP_UPLOADS)
    const userFolderId = await getOrCreateFolder(
      `${safeUserName}_${user.id.substring(0, 8)}`,
      rootFolderId as string,
    );

    // Folder khusus untuk pengajuan ini
    const requestFolderId = await getOrCreateFolder(
      result.request_number,
      userFolderId as string,
    );

    const uploadPromises = (requirements ?? []).map(
      async (requirement: any) => {
        const file = formData.get(
          `requirement_${requirement.id}`,
        ) as File | null;
        if (!file || file.size === 0) return;

        const originalFileName = sanitizeFilename(file.name);
        const safeRequirementName = sanitizeFilename(
          requirement.document_name,
        ).replace(/\s+/g, "_");

        // Nama file yang rapi: [NAMA_SYARAT]_[NAMA_ASLI]
        const finalFileName = `${safeRequirementName}_${originalFileName}`;

        // 1. Upload ke Cloudflare R2 (Struktur Rapi)
        const r2Path = `requests/${safeUserName}_${user.id.substring(0, 5)}/${result.request_number}/${finalFileName}`;
        const { path: storagePath } = await uploadToR2(file, r2Path);

        // 2. Backup ke Google Drive (Struktur Rapi)
        // Wajib di-await agar tidak di-kill oleh Vercel/Next.js saat response selesai
        await uploadToDrive(
          file,
          requestFolderId as string,
          finalFileName,
        ).catch((err) => {
          console.error(`Backup to GDrive failed for ${finalFileName}:`, err);
        });

        await prisma.service_request_documents.upsert({
          where: {
            request_id_requirement_id: {
              request_id: result.id,
              requirement_id: requirement.id,
            },
          },
          update: {
            file_name: finalFileName,
            file_path: storagePath,
            file_type: file.type || "application/octet-stream",
            file_size: BigInt(file.size),
          },
          create: {
            request_id: result.id,
            requirement_id: requirement.id,
            file_name: finalFileName,
            file_path: storagePath,
            file_type: file.type || "application/octet-stream",
            file_size: BigInt(file.size),
          },
        });
      },
    );

    await Promise.all(uploadPromises);

    return NextResponse.json({ id: result.id.toString() }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating request:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          error:
            "Terjadi gangguan sinkronisasi nomor pengajuan. Silakan coba klik Kirim kembali.",
        },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: error.message || "Gagal membuat pengajuan." },
      { status: 500 },
    );
  }
}
