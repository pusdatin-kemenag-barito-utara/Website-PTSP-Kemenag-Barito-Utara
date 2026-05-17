import { FolderKanban } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { serializeBigInt } from "@/lib/db";
import { PageHeader } from "@/components/admin/page-header";
import { AdminRequestFilter } from "@/components/admin/pengajuan/request-filter";
import { AdminRequestTable } from "@/components/admin/pengajuan/request-table";
import { AdminPagination } from "@/components/admin/pengajuan/admin-pagination";
import { ReportExportButton } from "@/components/admin/report-export-button";
import { RequestService } from "@/lib/services/request-service";
import { LayananService } from "@/lib/services/layanan-service";
import { isSuperAdmin, getAdminSpecificRole } from "@/lib/constants";

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    q?: string;
    serviceId?: string;
    page?: string;
  }>;
}) {
  const profile = await requireAdmin();
  const isSuper = isSuperAdmin(profile.email);
  const specificRole = getAdminSpecificRole(profile.email, profile.role ?? "");
  const isGeneralAdmin = specificRole === "admin_ptsp";

  const roleOwnerFilter = isSuper || isGeneralAdmin ? undefined : specificRole;

  const {
    status = "",
    q = "",
    serviceId = "",
    page = "1",
  } = await searchParams;

  const currentPage = Math.max(1, parseInt(page));
  const pageSize = 20;

  const [services, { data: rawRequests, totalCount, totalPages }] = await Promise.all([
    LayananService.getAllServicesBrief(roleOwnerFilter),
    RequestService.getPaginatedRequests({
      page: currentPage,
      pageSize,
      status,
      q,
      serviceId,
      roleOwner: roleOwnerFilter,
    }),
  ]);

  const requests = serializeBigInt(rawRequests);
  const serializedServices = serializeBigInt(services);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Kelola Pengajuan"
        description={`Tinjau dan proses pengajuan dari pemohon. Menampilkan ${rawRequests.length} dari ${totalCount} pengajuan.`}
        icon={FolderKanban}
        actions={
          <ReportExportButton
            type="requests"
            where={status || serviceId || q ? { status, serviceId, q } : {}}
            fileName="Laporan_Pengajuan_PTSP"
          />
        }
      />

      <AdminRequestFilter
        q={q}
        status={status}
        serviceId={serviceId}
        services={serializedServices}
      />

      <div className="space-y-4">
        <AdminRequestTable requests={requests} status={status} q={q} />

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
