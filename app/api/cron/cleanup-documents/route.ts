export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { db } from "@/lib/db";
import {
  serviceRequests as serviceRequestsTable,
  generatedDocuments as generatedDocumentsTable,
  serviceRequestDocuments as serviceRequestDocumentsTable,
} from "@/lib/db/schema";
import { eq, and, lt, not, inArray, isNotNull } from "drizzle-orm";
import { deleteFromR2 } from "@/lib/r2";

export async function GET(request: Request) {
  try {
    // Basic security: check secret token from query param or header
    const { searchParams } = new URL(request.url);
    const secret =
      searchParams.get("secret") ||
      request.headers.get("Authorization")?.replace("Bearer ", "");

    const validSecret = process.env.CRON_SECRET || "super-secret-cron-key-123";

    if (secret !== validSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Find all completed requests older than 3 days
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const expiredRequests = await db.query.serviceRequests.findMany({
      where: and(
        eq(serviceRequestsTable.status, "completed"),
        lt(serviceRequestsTable.completedAt, threeDaysAgo),
      ),
      columns: { id: true },
    });

    if (!expiredRequests.length) {
      return NextResponse.json({
        message: "Tidak ada dokumen yang perlu dibersihkan hari ini.",
      });
    }

    const expiredRequestIds = expiredRequests.map((r) => r.id);
    let deletedFilesCount = 0;
    const admin = createAdminClient();

    // 2. Clean up "Dokumen Hasil" (generated_documents)
    const generatedDocs = await db.query.generatedDocuments.findMany({
      where: and(
        inArray(generatedDocumentsTable.requestId, expiredRequestIds),
        not(eq(generatedDocumentsTable.filePath, "EXPIRED")),
      ),
    });

    if (generatedDocs.length > 0) {
      const pathsToDelete = generatedDocs.map((doc) => doc.filePath);

      // Delete physical files from Storage
      const { error: storageError } = await admin.storage
        .from("generated-documents")
        .remove(pathsToDelete);

      if (!storageError) {
        // Mark as expired in DB
        await db
          .update(generatedDocumentsTable)
          .set({ filePath: "EXPIRED" })
          .where(
            inArray(
              generatedDocumentsTable.id,
              generatedDocs.map((d) => d.id),
            ),
          );

        deletedFilesCount += pathsToDelete.length;
      }
    }

    // 3. Clean up "Dokumen Persyaratan" (service_request_documents)
    const reqDocs = await db.query.serviceRequestDocuments.findMany({
      where: and(
        inArray(serviceRequestDocumentsTable.requestId, expiredRequestIds),
        not(eq(serviceRequestDocumentsTable.filePath, "EXPIRED")),
      ),
    });

    // Handle R2 deletions
    const r2Docs = reqDocs.filter((doc) => doc.filePath.startsWith("r2:"));
    for (const doc of r2Docs) {
      try {
        await deleteFromR2(doc.filePath);
        await db
          .update(serviceRequestDocumentsTable)
          .set({ filePath: "EXPIRED" })
          .where(eq(serviceRequestDocumentsTable.id, doc.id));
        deletedFilesCount++;
      } catch (err) {
        console.error(`Failed to delete R2 doc ${doc.id}:`, err);
      }
    }

    // Filter out r2 links before Supabase storage deletion
    const supabaseDocs = reqDocs.filter(
      (doc) =>
        !doc.filePath.startsWith("r2:"),
    );

    if (supabaseDocs.length > 0) {
      const pathsToDelete = supabaseDocs.map((doc) => doc.filePath);

      const { error: storageError } = await admin.storage
        .from("request-documents")
        .remove(pathsToDelete);

      if (!storageError) {
        await db
          .update(serviceRequestDocumentsTable)
          .set({ filePath: "EXPIRED" })
          .where(
            inArray(
              serviceRequestDocumentsTable.id,
              supabaseDocs.map((d) => d.id),
            ),
          );

        deletedFilesCount += pathsToDelete.length;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Pembersihan berhasil. ${deletedFilesCount} file fisik telah dihapus permanen dari Supabase Storage.`,
      expired_requests_processed: expiredRequests.length,
    });
  } catch (error: any) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
