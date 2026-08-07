import { FolderKanban } from "lucide-react";
import { requirePermission } from "@/lib/auth";
import { PageHeader } from "@/components/admin/page-header";
import { AdminRequestFilter } from "@/components/admin/pengajuan/request-filter";
import { AdminRequestTable } from "@/components/admin/pengajuan/request-table";
import { AdminPagination } from "@/components/admin/pengajuan/admin-pagination";
import { ReportExportButton } from "@/components/admin/report-export-button";
import { RequestService } from "@/lib/services/request-service";
import { LayananService } from "@/lib/services/layanan-service";
import { isSuperAdmin, getAdminSpecificRole } from "@/lib/constants";
import { AutoRefresh } from "@/components/ui/auto-refresh";

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    q?: string;
    serviceId?: string;
    page?: string;
    type?: string;
  }>;
}) {
  const profile = await requirePermission("pengajuan");
  const isSuper = isSuperAdmin(profile.email);
  const specificRole = getAdminSpecificRole(profile.email, profile.role ?? "");
  const isGeneralAdmin = specificRole === "admin_ptsp";

  const roleOwnerFilter = isSuper || isGeneralAdmin ? undefined : specificRole;

  const {
    status = "",
    q = "",
    serviceId = "",
    page = "1",
    type = "public",
  } = await searchParams;

  const currentPage = Math.max(1, parseInt(page) || 1);
  const pageSize = 20;

  const [services, ptspData] = await Promise.all([
    LayananService.getAllServicesBrief(roleOwnerFilter, type),
    RequestService.getPaginatedRequests({
      page: currentPage,
      pageSize,
      status,
    }),
  ]);

  const rawRequests = ptspData.data;
  const totalCount = ptspData.totalCount;
  const totalPages = ptspData.totalPages;
  const serializedServices = services;
  const requests = rawRequests;


  return (
    <div className="space-y-5">
      <PageHeader
        title={type === "public" ? "Pengajuan Masyarakat" : "Pengajuan Pegawai"}
        description={`Tinjau dan proses pengajuan layanan dari ${type === "public" ? "pemohon" : "pegawai"}. Menampilkan ${rawRequests.length} dari ${totalCount} pengajuan.`}
        icon={FolderKanban}
        actions={
          <ReportExportButton
            type="requests"
            where={status || serviceId || q ? { status, serviceId, q } : {}}
            fileName={type === "public" ? "Laporan_Pengajuan_Masyarakat" : "Laporan_Pengajuan_Pegawai"}
          />
        }
      />

      <div className="space-y-4">
        <AdminRequestFilter
          q={q}
          status={status}
          serviceId={serviceId}
          services={serializedServices}
        />
        <AdminRequestTable requests={requests} status={status} q={q} />
        {totalPages > 1 && (
          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={Number(totalCount)}
          />
        )}
      </div>
      <AutoRefresh intervalMs={20000} />
    </div>
  );
}
