"use server";

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { deleteFromDrive } from "@/lib/google-drive";
import { deleteFromR2 } from "@/lib/r2";
import { revalidatePath } from "next/cache";
import { subMonths } from "date-fns";
import { createAuditLog } from "@/lib/audit";

/**
 * Membersihkan file permohonan (Requirements) yang sudah berumur > 3 bulan
 * dan statusnya sudah COMPLETED.
 * Dokumen Hasil (Result) TIDAK dihapus.
 */
export async function cleanupOldStorageAction() {
  const adminProfile = await requireAdmin();

  // Batas waktu: 3 bulan yang lalu
  const threeMonthsAgo = subMonths(new Date(), 3);

  // Cari pengajuan yang sudah SELESAI lebih dari 3 bulan
  const oldRequests = await prisma.service_requests.findMany({
    where: {
      status: "completed",
      completed_at: {
        lt: threeMonthsAgo,
      },
      // Pastikan masih punya dokumen permohonan yang belum ditandai terhapus
      service_request_documents: {
        some: {
          file_path: {
            not: "CLEANED_UP",
          },
        },
      },
    },
    include: {
      service_request_documents: true,
    },
  });

  if (oldRequests.length === 0) {
    return {
      success: true,
      count: 0,
      message: "Tidak ada file lama yang perlu dibersihkan.",
    };
  }

  let deletedCount = 0;

  for (const request of oldRequests) {
    for (const doc of request.service_request_documents) {
      if (!doc.file_path || doc.file_path === "CLEANED_UP") continue;

      try {
        // 1. Hapus dari Google Drive jika ada
        if (doc.file_path.startsWith("gdrive:")) {
          const fileId = doc.file_path.replace("gdrive:", "");
          await deleteFromDrive(fileId).catch((e: any) =>
            console.error("Gagal hapus Drive:", e),
          );
        }

        // 2. Hapus dari R2 jika ada
        if (doc.file_path.startsWith("r2:")) {
          await deleteFromR2(doc.file_path).catch((e: any) =>
            console.error("Gagal hapus R2:", e),
          );
        }

        // 3. Update status di database agar tidak diproses lagi
        await prisma.service_request_documents.update({
          where: { id: doc.id },
          data: { file_path: "CLEANED_UP" },
        });

        deletedCount++;
      } catch (err) {
        console.error(`Gagal membersihkan file doc ID ${doc.id}:`, err);
      }
    }
  }

  // Catat ke Audit Log
  await createAuditLog({
    adminId: adminProfile.id,
    action: "pembersihan_otomatis_storage",
    details: {
      jumlah_file_dihapus: deletedCount,
      jumlah_pengajuan_terdampak: oldRequests.length,
    },
  });

  revalidatePath("/admin");
  return {
    success: true,
    count: deletedCount,
    affectedRequests: oldRequests.length,
    message: `Pembersihan selesai. ${deletedCount} file dari ${oldRequests.length} pengajuan telah dihapus.`,
  };
}

/**
 * Mendapatkan estimasi jumlah file yang bisa dibersihkan
 */
export async function getCleanupStats() {
  await requireAdmin();
  const threeMonthsAgo = subMonths(new Date(), 3);

  const count = await prisma.service_requests.count({
    where: {
      status: "completed",
      completed_at: {
        lt: threeMonthsAgo,
      },
      service_request_documents: {
        some: {
          file_path: {
            not: "CLEANED_UP",
          },
        },
      },
    },
  });

  return { eligibleRequests: count };
}
