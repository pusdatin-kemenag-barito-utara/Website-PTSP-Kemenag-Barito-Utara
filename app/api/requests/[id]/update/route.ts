export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  uploadToDrive,
  deleteFromDrive,
  getOrCreateFolder,
} from "@/lib/google-drive";
import { sanitizeFilename } from "@/lib/utils";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const profile = await requireAuth();
    const { id } = await params;
    const formData = await request.formData();

    const answersJson = formData.get("answers") as string;
    const updates = JSON.parse(answersJson);

    const admin = createAdminClient();

    // Verify ownership and status
    const { data: reqData } = await admin
      .from("service_requests")
      .select("id, status, user_id")
      .eq("id", id)
      .eq("user_id", profile.id)
      .single();

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

    // 1. Update text answers
    for (const update of updates) {
      await admin
        .from("service_request_answers")
        .update({ field_value: update.field_value })
        .eq("id", update.id)
        .eq("request_id", id);
    }

    // 2. Prepare user folder in Google Drive (for new uploads)
    const mainFolderId = await getOrCreateFolder("File Persyaratan");
    const userFolderName = `${profile.full_name || "User"} (${profile.email})`;
    const userFolderId = await getOrCreateFolder(
      userFolderName,
      mainFolderId as string,
    );

    // 3. Fetch all existing documents for this request at once
    // This avoids "uuid = bigint" errors by doing the matching in memory
    const { data: existingDocs, error: fetchError } = await admin
      .from("service_request_documents")
      .select("*")
      .eq("request_id", id);

    if (fetchError) {
      console.error("[update] Error fetching existing docs:", fetchError);
    }

    // 4. Update documents
    const entries = Array.from(formData.entries());
    const fileEntries = entries.filter(([key]) => key.startsWith("doc_"));

    for (const [key, value] of fileEntries) {
      if (!(value instanceof File) || value.size === 0) continue;

      const docId = key.replace("doc_", "");
      console.log(`[update] Processing file for docId identifier: ${docId}`);

      // Find the document in memory
      // We check for both ID match and Requirement ID match
      const currentDoc = existingDocs?.find(
        (doc) =>
          String(doc.id) === docId || String(doc.requirement_id) === docId,
      );

      const newFileName = sanitizeFilename(value.name);
      const oldFilePath = currentDoc?.file_path;

      try {
        // 4a. Upload NEW file
        const newDriveFile = await uploadToDrive(value, userFolderId as string);
        const newStoragePath = `gdrive:${newDriveFile.id}`;

        if (currentDoc) {
          // UPDATE existing record
          const { error: dbError } = await admin
            .from("service_request_documents")
            .update({
              file_name: newFileName,
              file_path: newStoragePath,
              file_size: value.size,
              file_type: value.type || "application/octet-stream",
            })
            .eq("id", currentDoc.id);

          if (dbError) throw dbError;

          // Delete old file from Drive
          if (oldFilePath) {
            try {
              if (oldFilePath.startsWith("gdrive:")) {
                await deleteFromDrive(oldFilePath.replace("gdrive:", ""));
              } else {
                await admin.storage
                  .from("request-documents")
                  .remove([oldFilePath]);
              }
            } catch (delErr) {
              console.warn(`[update] Could not delete old file:`, delErr);
            }
          }
        } else {
          // INSERT new record (if not found in memory)
          const numericDocId = parseInt(docId);
          const { error: insError } = await admin
            .from("service_request_documents")
            .insert({
              request_id: id,
              requirement_id: isNaN(numericDocId) ? null : numericDocId,
              file_name: newFileName,
              file_path: newStoragePath,
              file_size: value.size,
              file_type: value.type || "application/octet-stream",
            });

          if (insError) throw insError;
        }

        console.log(`[update] Successfully handled document ${docId}`);
      } catch (err) {
        console.error(`[update] Failed to handle doc ${docId}:`, err);
      }
    }

    // 5. Activity log
    await admin.from("activity_logs").insert({
      request_id: id,
      actor_id: profile.id,
      action: "request_updated",
      notes: "Pemohon memperbarui data dan dokumen pengajuan.",
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
