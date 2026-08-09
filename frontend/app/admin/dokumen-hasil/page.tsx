import { requireAdmin } from "@/lib/auth";
import { fetchAPI } from "@/lib/api";
import { DokumenHasilClient } from "@/components/admin/dokumen-hasil/dokumen-hasil-client";
import { AdminPagination } from "@/components/admin/pengajuan/admin-pagination";
import { ReportExportButton } from "@/components/admin/report-export-button";
import { getR2SignedUrl } from "@/lib/r2";
import { PageHeader } from "@/components/admin/page-header";
import { FileOutput } from "lucide-react";
import { isSuperAdmin, getAdminSpecificRole } from "@/lib/constants";

async function getSignedUrl(path?: string | null) {
  if (!path) return null;

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

export const revalidate = 0;

export default async function AdminGeneratedDocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; serviceId?: string; page?: string; type?: string }>;
}) {
  const profile = await requireAdmin();
  const isSuper = isSuperAdmin(profile.email);
  const specificRole = getAdminSpecificRole(profile.email, profile.role ?? "");
  const isGeneralAdmin = specificRole === "admin_ptsp";

  const roleOwnerFilter = isSuper || isGeneralAdmin ? "" : specificRole;

  const { q = "", serviceId = "", page = "1", type = "public" } = await searchParams;

  const currentPage = Math.max(1, parseInt(page));
  const pageSize = 20;

  let requests: any[] = [];
  let totalCount = 0;
  let services: any[] = [];

  try {
    const res = await fetchAPI<any>(`/admin/requests?status=approved,completed&q=${encodeURIComponent(q)}&serviceId=${encodeURIComponent(serviceId)}&page=${currentPage}&limit=${pageSize}&category=${type}&roleOwner=${encodeURIComponent(roleOwnerFilter)}`);
    if (res && res.data) {
      requests = Array.isArray(res.data) ? res.data : (res.data.items || []);
      totalCount = res.data.total || requests.length;
    }

    const servicesRes = await fetchAPI<any>("/services");
    if (servicesRes && servicesRes.data && Array.isArray(servicesRes.data)) {
      services = servicesRes.data;
    }
  } catch (err) {
    console.error("Failed to fetch generated documents from Golang API:", err);
  }

  const totalPages = Math.ceil(Number(totalCount) / pageSize);

  // Generate signed URLs for existing documents
  const urlEntries = await Promise.all(
    requests.map(async (request: any) => {
      const docPath =
        request.generated_documents?.[0]?.file_path ||
        request.generatedDocuments?.[0]?.filePath ||
        request.documents?.[0]?.file_path ||
        request.documents?.[0]?.filePath ||
        null;
      return {
        id: request.id,
        url: await getSignedUrl(docPath),
      };
    }),
  );

  const urlMap = Object.fromEntries(
    urlEntries.map((item: any) => [item.id, item.url]),
  );

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
