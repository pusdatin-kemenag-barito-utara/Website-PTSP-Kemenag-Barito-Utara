import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteFromDrive } from "@/lib/google-drive";
import { deleteFromR2 } from "@/lib/r2";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const profile = await requireAuth();
    const { id } = await params;
    const requestId = id;

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
        { error: "Pengajuan yang sudah diproses tidak dapat dihapus." },
        { status: 400 },
      );
    }

    // Get all document paths to delete from storage
    const docs = await prisma.service_request_documents.findMany({
      where: { request_id: requestId },
      select: { id: true, file_path: true, file_name: true },
    });

    if (docs.length > 0) {
      console.log(`Cleaning up ${docs.length} documents for request ${id}...`);

      const admin = createAdminClient();
      const deletePromises = docs.map(async (doc: any) => {
        if (!doc.file_path) return;

        try {
          if (doc.file_path.startsWith("r2:")) {
            await deleteFromR2(doc.file_path);
          } else if (doc.file_path.startsWith("gdrive:")) {
            const driveFileId = doc.file_path.replace("gdrive:", "");
            await deleteFromDrive(driveFileId);
          } else {
            const { error: storageError } = await admin.storage
              .from("request-documents")
              .remove([doc.file_path]);
            if (storageError) throw storageError;
          }
          console.log(`Deleted document file: ${doc.file_name} (${doc.id})`);
        } catch (error) {
          console.error(
            `Failed to delete storage file for doc ${doc.id}:`,
            error,
          );
          // We continue to delete other files even if one fails
        }
      });

      await Promise.all(deletePromises);
    }

    // 4. Delete from DB (Prisma will handle cascading if DB is set up)
    console.log(`Deleting request ${id} from database...`);
    await prisma.service_requests.delete({
      where: { id: requestId },
    });

    console.log(`Request ${id} deleted successfully.`);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete error:", err);
    return NextResponse.json(
      { error: err.message || "Internal Error" },
      { status: 500 },
    );
  }
}
