import { requirePermission } from "@/lib/auth";
import { db, serializeBigInt } from "@/lib/db";
import {
  serviceRequests as serviceRequestsTable,
  services as servicesTable,
  profiles as profilesTable,
  generatedDocuments as generatedDocumentsTable,
  serviceItems as serviceItemsTable,
} from "@/lib/db/schema";
import { eq, and, or, ilike, sql, desc, asc } from "drizzle-orm";
import { DokumenHasilClient } from "@/components/admin/dokumen-hasil/dokumen-hasil-client";
import { AdminPagination } from "@/components/admin/pengajuan/admin-pagination";
import { ReportExportButton } from "@/components/admin/report-export-button";
import { getR2SignedUrl } from "@/lib/r2";
import { PageHeader } from "@/components/admin/page-header";
import { FileOutput } from "lucide-react";

async function getSignedUrl(path?: string | null) {
  if (!path) return null;

  // Handle Cloudflare R2 links
  if (path.startsWith("r2:") || path.startsWith("results/")) {
    try {
      return await getR2SignedUrl(path);
    } catch (err) {
      console.error("Gagal mendapatkan R2 Signed URL:", err);
      return null;
    }
  }

  return path;
}

import { isSuperAdmin, getAdminSpecificRole } from "@/lib/constants";

export default async function AdminGeneratedDocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; serviceId?: string; page?: string }>;
}) {
  const profile = await requirePermission("dokumen_hasil");
  const isSuper = isSuperAdmin(profile.email);
  const specificRole = getAdminSpecificRole(profile.email, profile.role ?? "");
  const isGeneralAdmin = specificRole === "admin_ptsp";

  const roleOwnerFilter = isSuper || isGeneralAdmin ? undefined : specificRole;

  const { q = "", serviceId = "", page = "1" } = await searchParams;

  const currentPage = Math.max(1, parseInt(page));
  const pageSize = 20;
  const offset = (currentPage - 1) * pageSize;

  const filters = [
    sql`EXISTS (SELECT 1 FROM ptsp_generated_documents WHERE ptsp_generated_documents.request_id = ${serviceRequestsTable.id})`,
  ];

  if (roleOwnerFilter) {
    filters.push(
      sql`EXISTS (SELECT 1 FROM ${servicesTable} WHERE ${servicesTable.id} = ${serviceRequestsTable.serviceId} AND ${servicesTable.roleOwner} = ${roleOwnerFilter})`
    );
  }

  if (serviceId) {
    filters.push(eq(serviceRequestsTable.serviceId, BigInt(serviceId)));
  }

  if (q) {
    const qFilter = `%${q}%`;
    filters.push(
      or(
        ilike(serviceRequestsTable.requestNumber, qFilter),
        sql`EXISTS (SELECT 1 FROM ptsp_profiles WHERE ptsp_profiles.id = ${serviceRequestsTable.userId} AND ptsp_profiles.full_name ILIKE ${qFilter})`,
      ) as any,
    );
  }

  const whereClause = and(...filters);

  // Fetch data and count in parallel
  const [rawRequests, [{ count: totalCount }]] = await Promise.all([
    db.query.serviceRequests.findMany({
      where: whereClause,
      with: {
        profiles: {
          columns: { fullName: true },
        },
        services: {
          columns: { id: true, name: true },
        },
        serviceItems: {
          columns: { name: true },
        },
        generatedDocuments: true,
      },
      orderBy: [desc(serviceRequestsTable.createdAt)],
      limit: pageSize,
      offset: offset,
    }),
    db
      .select({ count: sql<number>`count(*)` })
      .from(serviceRequestsTable)
      .where(whereClause),
  ]);

  // Fetch list of services for the filter dropdown
  const rawServices = await db.query.services.findMany({
    columns: { id: true, name: true },
    where: roleOwnerFilter ? eq(servicesTable.roleOwner, roleOwnerFilter as any) : undefined,
    orderBy: [asc(servicesTable.name)],
  });

  const requests = serializeBigInt(rawRequests);
  const services = serializeBigInt(rawServices);
  const totalPages = Math.ceil(Number(totalCount) / pageSize);

  // Generate signed URLs for existing documents
  const urlEntries = await Promise.all(
    requests.map(async (request: any) => ({
      id: request.id,
      url: await getSignedUrl(request.generatedDocuments?.[0]?.filePath),
    })),
  );

  const urlMap = Object.fromEntries(
    urlEntries.map((item: any) => [item.id, item.url]),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dokumen Hasil"
        description="Kelola dokumen PDF hasil layanan. Anda dapat mencari, melihat, dan mengunduh dokumen resmi yang telah diterbitkan untuk pemohon."
        icon={FileOutput}
        actions={
          <ReportExportButton
            type="documents"
            where={{ q, serviceId }}
            fileName="Laporan_Dokumen_Hasil_PTSP"
          />
        }
      />

      <div className="space-y-4">
        <DokumenHasilClient
          requests={requests || []}
          urlMap={urlMap}
          services={services || []}
          q={q}
          serviceId={serviceId}
        />

        {totalPages > 1 && (
          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={Number(totalCount)}
          />
        )}
      </div>
    </div>
  );
}
