import { FolderKanban } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { AdminRequestFilter } from "@/components/admin/pengajuan/request-filter";
import { AdminRequestTable } from "@/components/admin/pengajuan/request-table";
import { AdminPagination } from "@/components/admin/pengajuan/admin-pagination";
import { ReportExportButton } from "@/components/admin/report-export-button";
import { AutoRefresh } from "@/components/ui/auto-refresh";

export function AdminRequestsView({
  requests,
  services,
  status,
  q,
  serviceId,
  type,
  currentPage,
  totalPages,
  totalCount,
}: {
  requests: any[];
  services: any[];
  status: string;
  q: string;
  serviceId: string;
  type: string;
  currentPage: number;
  totalPages: number;
  totalCount: number;
}) {
  const rawRequests = requests;

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
          services={services}
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

export default AdminRequestsView;
