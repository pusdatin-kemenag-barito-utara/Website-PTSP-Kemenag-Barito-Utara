import { FolderKanban } from "lucide-react";
import { requirePermission } from "@/lib/auth";
import { serializeBigInt } from "@/lib/db";
import { PageHeader } from "@/components/admin/page-header";
import { AdminRequestFilter } from "@/components/admin/pengajuan/request-filter";
import { AdminRequestTable } from "@/components/admin/pengajuan/request-table";
import { AdminPagination } from "@/components/admin/pengajuan/admin-pagination";
import { ReportExportButton } from "@/components/admin/report-export-button";
import { RequestService } from "@/lib/services/request-service";
import { LayananService } from "@/lib/services/layanan-service";
import { isSuperAdmin, getAdminSpecificRole } from "@/lib/constants";
import { getAdminPengajuanCuti } from "@/lib/actions/admin/admin-cuti";
import { AdminCutiTable } from "@/components/admin/pengajuan/cuti/cuti-table";
import { AutoRefresh } from "@/components/ui/auto-refresh";
import Link from "next/link";

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    q?: string;
    serviceId?: string;
    page?: string;
    tab?: string;
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
    tab = "ptsp",
  } = await searchParams;

  const currentPage = Math.max(1, parseInt(page) || 1);
  const pageSize = 20;

  // PTSP Data
  let rawRequests: any[] = [];
  let totalCount = 0;
  let totalPages = 0;
  let serializedServices: any[] = [];

  // Cuti Data
  let cutiRequests: any[] = [];
  let cutiTotalPages = 0;
  let cutiTotalCount = 0;

  if (tab === "ptsp") {
    const [services, ptspData] = await Promise.all([
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
    rawRequests = ptspData.data;
    totalCount = ptspData.totalCount;
    totalPages = ptspData.totalPages;
    serializedServices = serializeBigInt(services);
  } else if (tab === "cuti") {
    const cutiData = await getAdminPengajuanCuti({ page: currentPage, pageSize, q });
    cutiRequests = cutiData.data;
    cutiTotalCount = cutiData.totalCount;
    cutiTotalPages = cutiData.totalPages;
  }

  const requests = serializeBigInt(rawRequests);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Kelola Pengajuan"
        description={tab === "ptsp" 
          ? `Tinjau dan proses pengajuan layanan dari pemohon. Menampilkan ${rawRequests.length} dari ${totalCount} pengajuan.`
          : `Tinjau dan proses pengajuan cuti pegawai. Menampilkan ${cutiRequests.length} dari ${cutiTotalCount} pengajuan cuti.`
        }
        icon={FolderKanban}
        actions={
          tab === "ptsp" && (
            <ReportExportButton
              type="requests"
              where={status || serviceId || q ? { status, serviceId, q } : {}}
              fileName="Laporan_Pengajuan_PTSP"
            />
          )
        }
      />

      <div className="bg-slate-100/50 p-1 rounded-lg inline-flex">
        <Link 
          href="/admin/pengajuan?tab=ptsp"
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            tab === "ptsp" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Layanan PTSP
        </Link>
        <Link 
          href="/admin/pengajuan?tab=cuti"
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            tab === "cuti" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Layanan Cuti
        </Link>
      </div>

      {tab === "ptsp" ? (
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
      ) : (
        <div className="space-y-4">
          {/* Untuk pencarian cuti bisa ditambahkan filternya nanti jika diperlukan */}
          <AdminCutiTable data={cutiRequests} />
          {cutiTotalPages > 1 && (
            <AdminPagination
              currentPage={currentPage}
              totalPages={cutiTotalPages}
              totalCount={Number(cutiTotalCount)}
            />
          )}
        </div>
      )}
      <AutoRefresh intervalMs={20000} />
    </div>
  );
}
