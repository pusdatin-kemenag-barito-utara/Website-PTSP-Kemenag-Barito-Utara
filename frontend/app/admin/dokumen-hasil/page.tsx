import { requireAdmin } from "@/lib/auth";
import { fetchAPI } from "@/lib/api";
import { DokumenHasilClient } from "@/components/admin/dokumen-hasil/dokumen-hasil-client";
import { AdminPagination } from "@/components/admin/pengajuan/admin-pagination";
import { ReportExportButton } from "@/components/admin/report-export-button";
import { getR2SignedUrl, isR2Path } from "@/lib/r2";
import { PageHeader } from "@/components/admin/page-header";
import { FileOutput } from "lucide-react";
import { isSuperAdmin, getAdminSpecificRole } from "@/lib/constants";

async function getSignedUrl(path?: string | null) {
  if (!path) return null;

  const isR2 = path.startsWith("r2:") || path.startsWith("results/") || isR2Path(path);
  if (isR2) {
    try {
      const url = await getR2SignedUrl(path);
      return url;
    } catch (err) {
      console.error("[R2 SignedURL Error]:", err);
      return null;
    }
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (path.startsWith("/uploads/") || path.startsWith("uploads/")) {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `http://127.0.0.1:8080${cleanPath}`;
  }

  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    const { data } = await admin.storage.from("generated-documents").createSignedUrl(path, 3600);
    return data?.signedUrl || null;
  } catch {
    return path;
  }
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

  // Ensure generated_documents and generatedDocuments are populated on requests array
  const enrichedRequests = await Promise.all(
    requests.map(async (req: any) => {
      let gDocs = req.generated_documents || req.generatedDocuments || [];
      if (!gDocs || gDocs.length === 0) {
        // Direct DB fallback query via Supabase SQL client to fetch generated documents
        try {
          const { createAdminClient } = await import("@/lib/supabase/admin");
          const admin = createAdminClient();
          const { data } = await admin
            .schema("kemenag_ptsp")
            .from("ptsp_generated_documents")
            .select("id, file_name, file_path, file_type, file_size, created_at")
            .eq("request_id", req.id);
          if (data && data.length > 0) {
            gDocs = data.map((d: any) => ({
              id: String(d.id),
              fileName: d.file_name,
              filePath: d.file_path,
              fileType: d.file_type,
              fileSize: d.file_size,
              createdAt: d.created_at,
            }));
          }
        } catch (e) {
          console.error("Fallback query generated documents error:", e);
        }
      }
      return {
        ...req,
        generated_documents: gDocs,
        generatedDocuments: gDocs,
      };
    })
  );

  // Generate signed URLs using enriched requests
  const urlEntries = await Promise.all(
    enrichedRequests.map(async (request: any) => {
      const genDocs = request.generated_documents || request.generatedDocuments || [];
      const reqDocs = request.request_documents || request.documents || [];
      const docPath =
        genDocs[0]?.file_path ||
        genDocs[0]?.filePath ||
        reqDocs[0]?.file_path ||
        reqDocs[0]?.filePath ||
        null;
      return {
        id: request.id,
        url: await getSignedUrl(docPath),
      };
    }),
  );

  const enrichedUrlMap = Object.fromEntries(
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
          requests={enrichedRequests || []}
          urlMap={enrichedUrlMap}
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
