import { DokumenHasilClient } from "@/components/admin/dokumen-hasil/dokumen-hasil-client";
import { AdminPagination } from "@/components/admin/pengajuan/admin-pagination";
import { ReportExportButton } from "@/components/admin/report-export-button";

export function DokumenHasilView({
  requests,
  urlMap,
  services,
  q,
  serviceId,
  currentPage,
  totalPages,
  totalCount,
  type,
}: {
  requests: any[];
  urlMap: Record<string, string | null>;
  services: any[];
  q: string;
  serviceId: string;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  type: string;
}) {
  return (
    <div className="space-y-4 pb-6">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white px-4 py-3 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-sm font-black text-slate-900 leading-tight">
            {type === "public" ? "Dokumen Hasil Layanan Masyarakat" : "Dokumen Hasil Layanan Pegawai (ASN)"}
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Kelola dokumen PDF hasil layanan resmi yang telah diterbitkan untuk {type === "public" ? "pemohon masyarakat" : "pegawai ASN"}.
          </p>
        </div>
        <ReportExportButton
          type="documents"
          where={{ q, serviceId }}
          fileName="Laporan_Dokumen_Hasil_PTSP"
        />
      </div>

      <div className="space-y-4">
        <DokumenHasilClient
          requests={requests || []}
          urlMap={urlMap || {}}
          services={services || []}
          q={q}
          serviceId={serviceId}
          type={type}
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

export default DokumenHasilView;
