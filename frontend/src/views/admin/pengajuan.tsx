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
    <div className="space-y-4 pb-6">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white px-4 py-3 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-sm font-black text-slate-900 leading-tight">
            {type === "public" ? "Pengajuan Layanan Masyarakat" : "Pengajuan Layanan Pegawai (ASN)"}
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Tinjau dan proses pengajuan layanan dari {type === "public" ? "pemohon masyarakat" : "pegawai ASN"}. Menampilkan {rawRequests.length} dari {totalCount} pengajuan.
          </p>
        </div>
        <ReportExportButton
          type="requests"
          where={status || serviceId || q ? { status, serviceId, q } : {}}
          fileName={type === "public" ? "Laporan_Pengajuan_Masyarakat" : "Laporan_Pengajuan_Pegawai"}
        />
      </div>

      <div className="space-y-4">
        <AdminRequestFilter
          q={q}
          status={status}
          serviceId={serviceId}
          services={services}
          type={type}
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
