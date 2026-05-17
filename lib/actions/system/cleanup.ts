"use server";

import { requirePermission } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { SystemService } from "@/lib/services/system-service";
import { db } from "@/lib/db";
import { serviceRequests as serviceRequestsTable, serviceRequestDocuments as serviceRequestDocumentsTable } from "@/lib/db/schema";
import { eq, and, lt, sql } from "drizzle-orm";
import { subMonths } from "date-fns";

export type ActionResult = {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
};

/**
 * Membersihkan file permohonan (Requirements) yang sudah berumur > 3 bulan
 * dan statusnya sudah COMPLETED.
 */
export async function cleanupOldStorageAction(): Promise<ActionResult> {
  try {
    const adminProfile = await requirePermission("super_admin");

    const result = await SystemService.cleanupOldStorage(adminProfile.id);

    revalidatePath("/admin");
    return {
      success: true,
      message: `Pembersihan selesai. ${result.count} file dari ${result.affectedRequests} pengajuan telah dihapus.`,
      data: result,
    };
  } catch (error: any) {
    console.error("Cleanup error:", error);
    return { success: false, error: error.message || "Gagal menjalankan pembersihan" };
  }
}

/**
 * Mendapatkan estimasi jumlah file yang bisa dibersihkan
 */
export async function getCleanupStats(): Promise<{ eligibleRequests: number }> {
  try {
    await requirePermission("super_admin");
    const threeMonthsAgo = subMonths(new Date(), 3);

    const whereClause = and(
      eq(serviceRequestsTable.status, "completed"),
      lt(serviceRequestsTable.completedAt, threeMonthsAgo),
      sql`EXISTS (
        SELECT 1 FROM ${serviceRequestDocumentsTable} 
        WHERE ${serviceRequestDocumentsTable.requestId} = ${serviceRequestsTable.id} 
        AND ${serviceRequestDocumentsTable.filePath} <> 'CLEANED_UP'
      )`,
    );

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(serviceRequestsTable)
      .where(whereClause);

    return { eligibleRequests: Number(count) };
  } catch (error) {
    return { eligibleRequests: 0 };
  }
}
