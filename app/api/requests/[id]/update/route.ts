export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  uploadToDrive,
  deleteFromDrive,
  getOrCreateFolder,
} from "@/lib/google-drive";
import { sanitizeFilename } from "@/lib/utils";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const profile = await requireAuth();
    const { id } = await params;
    const requestId = id;
    const formData = await request.formData();

    const answersJson = formData.get("answers") as string;
    const updates = JSON.parse(answersJson);

    // Verify ownership and status
    const reqData = await prisma.service_requests.findUnique({
      where: {
        id: requestId,
        user_id: profile.id,
      },
      select: { id: true, status: true },
    });

    if (!reqData) {
      return NextResponse.json(
        { error: "Pengajuan tidak ditemukan" },
        { status: 404 },
      );
    }

    if (
      !["submitted", "under_review", "revision_required"].includes(
        reqData.status,
      )
    ) {
      return NextResponse.json(
        { error: "Status pengajuan saat ini tidak dapat diubah." },
        { status: 400 },
      );
    }

    // 1. Prepare user folder in Google Drive (for new uploads)
    const mainFolderId = await getOrCreateFolder("File Persyaratan");
    const userFolderName = `${profile.full_name || "User"} (${profile.email})`;
    const userFolderId = await getOrCreateFolder(
      userFolderName,
      mainFolderId as string,
    );

    // 2. Fetch existing documents
    const existingDocs = await prisma.service_request_documents.findMany({
      where: { request_id: requestId },
    });

    // 3. Process updates in a transaction
    await prisma.$transaction(async (tx) => {
      // 3a. Update text answers
      for (const update of updates as any[]) {
        await tx.service_request_answers.updateMany({
          where: {
            id: BigInt(update.id),
            request_id: requestId,
          },
          data: {
            field_value: update.field_value,
          },
        });
      }

      // 3b. Update documents
      const entries = Array.from(formData.entries());
      const fileEntries = entries.filter(([key]: any) =>
        key.startsWith("doc_"),
      );

      for (const [key, value] of fileEntries) {
        if (!(value instanceof File) || value.size === 0) continue;

        const docIdStr = key.replace("doc_", "");
        const docId = BigInt(docIdStr);

        // Find matching document by ID or Requirement ID
        const currentDoc = existingDocs.find(
          (doc: any) => doc.id === docId || doc.requirement_id === docId,
        );

        const newFileName = sanitizeFilename(value.name);
        const oldFilePath = currentDoc?.file_path;

        // Upload NEW file to Drive
        const newDriveFile = await uploadToDrive(value, userFolderId as string);
        const newStoragePath = `gdrive:${newDriveFile.id}`;

        if (currentDoc) {
          // UPDATE record
          await tx.service_request_documents.update({
            where: { id: currentDoc.id },
            data: {
              file_name: newFileName,
              file_path: newStoragePath,
              file_size: BigInt(value.size),
              file_type: value.type || "application/octet-stream",
            },
          });

          // Cleanup old file (async, outside transaction ideally, but we handle errors)
          if (oldFilePath) {
            try {
              if (oldFilePath.startsWith("gdrive:")) {
                await deleteFromDrive(oldFilePath.replace("gdrive:", ""));
              } else {
                const admin = createAdminClient();
                await admin.storage
                  .from("request-documents")
                  .remove([oldFilePath]);
              }
            } catch (delErr) {
              console.warn(`[update] Could not delete old file:`, delErr);
            }
          }
        } else {
          // INSERT new record
          await tx.service_request_documents.create({
            data: {
              request_id: requestId,
              requirement_id: docId, // assuming docId is requirement_id here
              file_name: newFileName,
              file_path: newStoragePath,
              file_size: BigInt(value.size),
              file_type: value.type || "application/octet-stream",
            },
          });
        }
      }

      // 3c. Activity log
      await tx.activity_logs.create({
        data: {
          request_id: requestId,
          actor_id: profile.id,
          action: "request_updated",
          notes: "Pemohon memperbarui data dan dokumen pengajuan.",
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[update] Unhandled error:", err);
    return NextResponse.json(
      { error: err.message || "Internal Error" },
      { status: 500 },
    );
  }
}
