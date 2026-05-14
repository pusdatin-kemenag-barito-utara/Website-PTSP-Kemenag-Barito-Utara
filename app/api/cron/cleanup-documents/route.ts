export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import prisma from "@/lib/prisma";
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

    const expiredRequests = await prisma.service_requests.findMany({
      where: {
        status: "completed",
        completed_at: {
          lt: threeDaysAgo,
        },
      },
      select: { id: true },
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
    const generatedDocs = await prisma.generated_documents.findMany({
      where: {
        request_id: { in: expiredRequestIds },
        file_path: { not: "EXPIRED" },
      },
    });

    if (generatedDocs.length > 0) {
      const pathsToDelete = generatedDocs.map((doc) => doc.file_path);

      // Delete physical files from Storage
      const { error: storageError } = await admin.storage
        .from("generated-documents")
        .remove(pathsToDelete);

      if (!storageError) {
        // Mark as expired in DB
        await prisma.generated_documents.updateMany({
          where: {
            id: { in: generatedDocs.map((d) => d.id) },
          },
          data: { file_path: "EXPIRED" },
        });

        deletedFilesCount += pathsToDelete.length;
      }
    }

    // 3. Clean up "Dokumen Persyaratan" (service_request_documents)
    const reqDocs = await prisma.service_request_documents.findMany({
      where: {
        request_id: { in: expiredRequestIds },
        file_path: { not: "EXPIRED" },
      },
    });

    // Handle R2 deletions
    const r2Docs = reqDocs.filter(doc => doc.file_path.startsWith("r2:"));
    for (const doc of r2Docs) {
      try {
        await deleteFromR2(doc.file_path);
        await prisma.service_request_documents.update({
          where: { id: doc.id },
          data: { file_path: "EXPIRED" }
        });
        deletedFilesCount++;
      } catch (err) {
        console.error(`Failed to delete R2 doc ${doc.id}:`, err);
      }
    }

    // Filter out gdrive and r2 links before Supabase storage deletion
    const supabaseDocs = reqDocs.filter(doc => 
      !doc.file_path.startsWith("gdrive:") && 
      !doc.file_path.startsWith("r2:")
    );

    if (supabaseDocs.length > 0) {
      const pathsToDelete = supabaseDocs.map((doc) => doc.file_path);

      const { error: storageError } = await admin.storage
        .from("request-documents")
        .remove(pathsToDelete);

      if (!storageError) {
        await prisma.service_request_documents.updateMany({
          where: {
            id: { in: supabaseDocs.map((d) => d.id) },
          },
          data: { file_path: "EXPIRED" },
        });

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
