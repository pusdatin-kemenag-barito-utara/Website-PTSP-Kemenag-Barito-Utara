import { FolderKanban } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import prisma, { serializeBigInt } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { AdminRequestFilter } from "@/components/admin/pengajuan/request-filter";
import { AdminRequestTable } from "@/components/admin/pengajuan/request-table";
import { AdminPagination } from "@/components/admin/pengajuan/admin-pagination";
import { ReportExportButton } from "@/components/admin/report-export-button";

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    status?: string; 
    q?: string; 
    service_id?: string;
    page?: string;
  }>;
}) {
  await requireAdmin();
  const { status = "", q = "", service_id = "", page = "1" } = await searchParams;

  const currentPage = Math.max(1, parseInt(page));
  const pageSize = 20;
  const skip = (currentPage - 1) * pageSize;

  // Fetch list of services for the filter dropdown
  const services = await prisma.services.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // Build the where clause for server-side filtering
  const where: any = {};
  if (status) {
    where.status = status;
  }
  if (service_id) {
    where.service_id = BigInt(service_id);
  }

  if (q) {
    where.OR = [
      { request_number: { contains: q, mode: 'insensitive' } },
      { profiles: { full_name: { contains: q, mode: 'insensitive' } } },
      { profiles: { email: { contains: q, mode: 'insensitive' } } },
    ];
  }

  // Fetch data and count in parallel
  const [rawRequests, totalCount] = await Promise.all([
    prisma.service_requests.findMany({
      where,
      include: {
        profiles: {
          select: { full_name: true, email: true },
        },
        services: {
          select: { name: true },
        },
        service_items: {
          select: { name: true },
        },
      },
      orderBy: { created_at: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.service_requests.count({ where }),
  ]);

  const requests = serializeBigInt(rawRequests);
  const serializedServices = serializeBigInt(services);
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Kelola Pengajuan"
        description={`Tinjau dan proses pengajuan dari pemohon. Menampilkan ${rawRequests.length} dari ${totalCount} pengajuan.`}
        icon={FolderKanban}
        actions={
          <ReportExportButton 
            type="requests"
            where={where}
            fileName="Laporan_Pengajuan_PTSP"
          />
        }
      />

      <AdminRequestFilter
        q={q}
        status={status}
        service_id={service_id}
        services={serializedServices}
      />

      <div className="space-y-4">
        <AdminRequestTable requests={requests} status={status} q={q} />
        
        {totalPages > 1 && (
          <AdminPagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            totalCount={totalCount}
          />
        )}
      </div>
    </div>
  );
}
