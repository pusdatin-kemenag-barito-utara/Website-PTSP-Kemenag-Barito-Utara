import { DokumenHasilClient } from "@/components/admin/dokumen-hasil/dokumen-hasil-client";
import { AdminPagination } from "@/components/admin/pengajuan/admin-pagination";
import { ReportExportButton } from "@/components/admin/report-export-button";
import { PageHeader } from "@/components/admin/page-header";
import { FileOutput } from "lucide-react";

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
    <div className="space-y-6">
      <PageHeader
        title={type === "public" ? "Dokumen Hasil Masyarakat" : "Dokumen Hasil Pegawai"}
        description={`Kelola dokumen PDF hasil layanan. Anda dapat mencari, melihat, dan mengunduh dokumen resmi yang telah diterbitkan untuk ${type === "public" ? "pemohon" : "pegawai"}.`}
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
          urlMap={urlMap || {}}
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

export default DokumenHasilView;
