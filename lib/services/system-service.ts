import { db } from "@/lib/db";
import {
  serviceRequests as serviceRequestsTable,
  serviceRequestDocuments as serviceRequestDocumentsTable,
  services as servicesTable,
  profiles as profilesTable,
  generatedDocuments as generatedDocumentsTable,
  auditLogs as auditLogsTable,
} from "@/lib/db/schema";
import { eq, and, lt, sql, or, ilike, desc } from "drizzle-orm";
import { deleteFromR2 } from "@/lib/r2";
import { subMonths, format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { createAuditLog } from "@/lib/audit";

export class SystemService {
  /**
   * Cleanup requirement files older than 3 months for COMPLETED requests
   */
  static async cleanupOldStorage(adminId: string) {
    // ... logic remains same ...
    const threeMonthsAgo = subMonths(new Date(), 3);

    const whereClause = and(
      eq(serviceRequestsTable.status, "completed"),
      lt(serviceRequestsTable.completedAt, threeMonthsAgo),
      sql`EXISTS (
        SELECT 1 FROM ${serviceRequestDocumentsTable} 
        WHERE ${serviceRequestDocumentsTable.requestId} = ${serviceRequestsTable.id} 
        AND ${serviceRequestDocumentsTable.filePath} <> 'CLEANED_UP'
        AND ${serviceRequestDocumentsTable.filePath} <> 'EXPIRED'
      )`,
    );

    const oldRequests = await db.query.serviceRequests.findMany({
      where: whereClause,
      with: { serviceRequestDocuments: true },
    });

    if (oldRequests.length === 0) return { count: 0, affectedRequests: 0 };

    let deletedCount = 0;

    for (const request of oldRequests) {
      for (const doc of (request as any).serviceRequestDocuments) {
        if (!doc.filePath || doc.filePath === "CLEANED_UP") continue;

        try {
          if (doc.filePath.startsWith("r2:")) {
            await deleteFromR2(doc.filePath).catch(() => {});
          }

          await db
            .update(serviceRequestDocumentsTable)
            .set({ filePath: "CLEANED_UP", updatedAt: new Date() })
            .where(eq(serviceRequestDocumentsTable.id, doc.id));

          deletedCount++;
        } catch (err) {
          console.error(`Cleanup failure for doc ${doc.id}:`, err);
        }
      }
    }

    await createAuditLog({
      adminId,
      action: "pembersihan_otomatis_storage",
      details: {
        jumlah_file_dihapus: deletedCount,
        jumlah_pengajuan_terdampak: oldRequests.length,
      },
    });

    return { count: deletedCount, affectedRequests: oldRequests.length };
  }

  /**
   * Get requests data for Excel export
   */
  static async getRequestsForExport(params: { q?: string; serviceId?: string; status?: string }) {
    const { q, serviceId, status } = params;
    const filters = [];

    if (q) {
      filters.push(
        or(
          ilike(serviceRequestsTable.requestNumber, `%${q}%`),
          sql`EXISTS (SELECT 1 FROM ${profilesTable} WHERE ${profilesTable.id} = ${serviceRequestsTable.userId} AND ${ilike(profilesTable.fullName, `%${q}%`)})`,
        ),
      );
    }

    if (serviceId && serviceId !== "all") {
      filters.push(eq(serviceRequestsTable.serviceId, BigInt(serviceId)));
    }

    if (status && status !== "all") {
      filters.push(eq(serviceRequestsTable.status, status as any));
    }

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const rawRequests = await db.query.serviceRequests.findMany({
      where: whereClause,
      with: {
        profiles: { columns: { fullName: true, email: true } },
        services: { columns: { name: true } },
        serviceItems: { columns: { name: true } },
      },
      orderBy: [desc(serviceRequestsTable.createdAt)],
    });

    return rawRequests.map((r: any) => ({
      "No. Permohonan": r.requestNumber,
      Tanggal: format(new Date(r.createdAt), "dd MMMM yyyy", { locale: idLocale }),
      "Nama Pemohon": r.profiles?.fullName || "-",
      Email: r.profiles?.email || "-",
      Layanan: r.services?.name || "-",
      "Sub Layanan": r.serviceItems?.name || "-",
      Status: r.status.toUpperCase(),
    }));
  }

  /**
   * Get documents data for Excel export
   */
  static async getDocumentsForExport(params: { q?: string; serviceId?: string }) {
    const { q, serviceId } = params;
    const filters = [
      sql`EXISTS (SELECT 1 FROM ${generatedDocumentsTable} WHERE ${generatedDocumentsTable.requestId} = ${serviceRequestsTable.id})`,
    ];

    if (q) {
      filters.push(
        or(
          ilike(serviceRequestsTable.requestNumber, `%${q}%`),
          sql`EXISTS (SELECT 1 FROM ${profilesTable} WHERE ${profilesTable.id} = ${serviceRequestsTable.userId} AND ${ilike(profilesTable.fullName, `%${q}%`)})`,
        ) as any,
      );
    }

    if (serviceId && serviceId !== "all") {
      filters.push(eq(serviceRequestsTable.serviceId, BigInt(serviceId)));
    }

    const whereClause = and(...filters);

    const rawRequests = await db.query.serviceRequests.findMany({
      where: whereClause,
      with: {
        profiles: { columns: { fullName: true } },
        services: { columns: { name: true } },
        serviceItems: { columns: { name: true } },
        generatedDocuments: true,
      },
      orderBy: [desc(serviceRequestsTable.createdAt)],
    });

    return rawRequests.map((r: any) => ({
      "No. Permohonan": r.requestNumber,
      "Nama Pemohon": r.profiles?.fullName || "-",
      Layanan: r.services?.name || "-",
      "Sub Layanan": r.serviceItems?.name || "-",
      "Tanggal Selesai": r.completedAt
        ? format(new Date(r.completedAt), "dd MMMM yyyy", { locale: idLocale })
        : "-",
      "Nama File": r.generatedDocuments?.[0]?.fileName || "-",
    }));
  }

  /**
   * Get paginated audit logs for Admin view
   */
  static async getPaginatedAuditLogs(params: { page: number; pageSize: number; q?: string; action?: string; from?: string; to?: string; entityType?: string }) {
    const { page, pageSize, q, action, from, to, entityType } = params;
    const offset = (page - 1) * pageSize;

    const filters = [];
    if (q) {
      filters.push(
        or(
          ilike(auditLogsTable.entityType, `%${q}%`),
          ilike(auditLogsTable.action, `%${q}%`),
          sql`EXISTS (SELECT 1 FROM ${profilesTable} WHERE ${profilesTable.id} = ${auditLogsTable.adminId} AND (${ilike(profilesTable.fullName, `%${q}%`)} OR ${ilike(profilesTable.email, `%${q}%`)}))`
        )
      );
    }
    if (action && action !== "all") {
      filters.push(ilike(auditLogsTable.action, `%${action}%`));
    }
    if (from) {
      filters.push(sql`${auditLogsTable.createdAt} >= ${from}::timestamp`);
    }
    if (to) {
      filters.push(sql`${auditLogsTable.createdAt} <= ${to}::timestamp + interval '1 day'`);
    }
    if (entityType && entityType !== "all") {
      filters.push(eq(auditLogsTable.entityType, entityType));
    }

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const [data, [{ count }]] = await Promise.all([
      db.query.auditLogs.findMany({
        where: whereClause,
        with: {
          profile: { columns: { fullName: true, email: true, role: true } },
        },
        orderBy: [desc(auditLogsTable.createdAt)],
        limit: pageSize,
        offset: offset,
      }),
      db.select({ count: sql<number>`count(*)` }).from(auditLogsTable).where(whereClause),
    ]);

    return {
      data,
      totalCount: Number(count),
      totalPages: Math.ceil(Number(count) / pageSize),
    };
  }

  /**
   * Export all audit logs matching filters (no pagination)
   */
  static async exportAuditLogs(params: { q?: string; action?: string; from?: string; to?: string; entityType?: string }) {
    const { q, action, from, to, entityType } = params;

    const filters = [];
    if (q) {
      filters.push(
        or(
          ilike(auditLogsTable.entityType, `%${q}%`),
          ilike(auditLogsTable.action, `%${q}%`),
          sql`EXISTS (SELECT 1 FROM ${profilesTable} WHERE ${profilesTable.id} = ${auditLogsTable.adminId} AND (${ilike(profilesTable.fullName, `%${q}%`)} OR ${ilike(profilesTable.email, `%${q}%`)}))`
        )
      );
    }
    if (action && action !== "all") {
      filters.push(ilike(auditLogsTable.action, `%${action}%`));
    }
    if (from) {
      filters.push(sql`${auditLogsTable.createdAt} >= ${from}::timestamp`);
    }
    if (to) {
      filters.push(sql`${auditLogsTable.createdAt} <= ${to}::timestamp + interval '1 day'`);
    }
    if (entityType && entityType !== "all") {
      filters.push(eq(auditLogsTable.entityType, entityType));
    }

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const data = await db.query.auditLogs.findMany({
      where: whereClause,
      with: {
        profile: { columns: { fullName: true, email: true, role: true } },
      },
      orderBy: [desc(auditLogsTable.createdAt)],
    });

    return data.map((log: any) => ({
      Waktu: format(new Date(log.createdAt), "dd MMM yyyy HH:mm:ss", { locale: idLocale }),
      Petugas: log.profile?.fullName || "-",
      Email: log.profile?.email || "-",
      Aksi: log.action,
      TipeObjek: log.entityType || "-",
      IDObjek: log.entityId || "-",
      IPAddress: log.ipAddress || "-",
      Detail: JSON.stringify(log.details || {}),
    }));
  }

  /**
   * Get real-time storage stats
   */
  static async getStorageStats() {
    const { getR2Usage } = await import("@/lib/r2");

    const r2Usage = await getR2Usage().catch(() => ({ totalSize: 0, fileCount: 0 }));

    return {
      cloudflareR2: {
        usage: r2Usage.totalSize,
        fileCount: r2Usage.fileCount,
      }
    };
  }
}
