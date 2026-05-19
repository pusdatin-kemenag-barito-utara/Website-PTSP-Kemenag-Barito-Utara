export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import {
  serviceRequests as serviceRequestsTable,
  serviceRequirements as serviceRequirementsTable,
  serviceRequestDocuments as serviceRequestDocumentsTable,
  profiles as profilesTable,
  activityLogs as activityLogsTable,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { sanitizeFilename } from "@/lib/utils";
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

  const serviceRequest = await db.query.serviceRequests.findFirst({
    where: and(
      eq(serviceRequestsTable.id, requestId),
      eq(serviceRequestsTable.userId, user.id),
    ),
  });

  if (!serviceRequest) {
    return NextResponse.json(
      { error: "Pengajuan tidak ditemukan." },
      { status: 404 },
    );
  }

  const formData = await request.formData();
  const requirementIdInput = formData.get("requirementId") as string;
  const file = formData.get("file") as File | null;

  if (!requirementIdInput || !file || file.size === 0) {
    return NextResponse.json(
      { error: "Dokumen revisi tidak valid." },
      { status: 400 },
    );
  }

  const requirementId = BigInt(requirementIdInput);

  const requirement = await db.query.serviceRequirements.findFirst({
    where: eq(serviceRequirementsTable.id, requirementId),
  });

  if (!requirement) {
    return NextResponse.json(
      { error: "Persyaratan dokumen tidak ditemukan." },
      { status: 404 },
    );
  }

  // Pastikan requirement ini benar-benar ditujukan untuk tipe item layanan yang diajukan
  if (BigInt(requirement.serviceItemId) !== BigInt(serviceRequest.serviceItemId)) {
    return NextResponse.json(
      { error: "Persyaratan dokumen tidak sesuai dengan pengajuan ini." },
      { status: 400 },
    );
  }

  if (file.size > (Number(requirement.maxFileSizeMb) || 5) * 1024 * 1024) {
    return NextResponse.json(
      { error: "Ukuran file melebihi batas." },
      { status: 400 },
    );
  }

  if (
    !isAllowedExtension(
      file.name,
      requirement.allowedExtensions || "pdf,jpg,jpeg,png",
    )
  ) {
    return NextResponse.json(
      { error: "Format file tidak diizinkan." },
      { status: 400 },
    );
  }

  const fileName = sanitizeFilename(file.name);

  // 1. Check for existing document to delete from Cloudflare R2
  const existingDoc = await db.query.serviceRequestDocuments.findFirst({
    where: and(
      eq(serviceRequestDocumentsTable.requestId, requestId),
      eq(serviceRequestDocumentsTable.requirementId, requirementId),
    ),
    columns: { filePath: true },
  });

  if (existingDoc?.filePath) {
    if (existingDoc.filePath.startsWith("r2:")) {
      await deleteFromR2(existingDoc.filePath).catch(console.error);
    }
  }

  // 2. Upload to Cloudflare R2
  const r2Path = `requests/${requestId}/${requirementId}_${fileName}`;
  const { path: storagePath } = await uploadToR2(file, r2Path);

  try {
    await db.transaction(async (tx) => {
      await tx
        .insert(serviceRequestDocumentsTable)
        .values({
          requestId: requestId,
          requirementId: requirementId,
          fileName: fileName,
          filePath: storagePath || "",
          fileType: file.type || "application/octet-stream",
          fileSize: BigInt(file.size),
        })
        .onConflictDoUpdate({
          target: [
            serviceRequestDocumentsTable.requestId,
            serviceRequestDocumentsTable.requirementId,
          ],
          set: {
            fileName: fileName,
            filePath: storagePath || "",
            fileType: file.type || "application/octet-stream",
            fileSize: BigInt(file.size),
          },
        });

      await tx
        .update(serviceRequestsTable)
        .set({
          status: "submitted",
          revisionNote: null,
        })
        .where(eq(serviceRequestsTable.id, requestId));

      await tx.insert(activityLogsTable).values({
        requestId: requestId,
        actorId: user.id,
        action: "revision_uploaded",
        notes: `Revisi dokumen ${requirement.documentName} diupload.`,
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
