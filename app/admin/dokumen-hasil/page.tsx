import { requireAdmin } from "@/lib/auth";
import prisma, { serializeBigInt } from "@/lib/prisma";
import { DokumenHasilClient } from "@/components/admin/dokumen-hasil/dokumen-hasil-client";
import { getDrivePreviewUrl } from "@/lib/google-drive";
import { AdminPagination } from "@/components/admin/pengajuan/admin-pagination";
import { ReportExportButton } from "@/components/admin/report-export-button";
import { getR2SignedUrl } from "@/lib/r2";
import { PageHeader } from "@/components/admin/page-header";
import { FileOutput } from "lucide-react";

async function getSignedUrl(path?: string | null) {
  if (!path) return null;

  // Handle Google Drive links
  if (path.startsWith("gdrive:")) {
    const fileId = path.replace("gdrive:", "");
    return getDrivePreviewUrl(fileId);
  }

  // Handle Cloudflare R2 links
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

export default async function AdminGeneratedDocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; service_id?: string; page?: string }>;
}) {
  await requireAdmin();
  const { q = "", service_id = "", page = "1" } = await searchParams;

  const currentPage = Math.max(1, parseInt(page));
  const pageSize = 20;
  const skip = (currentPage - 1) * pageSize;

  const where: any = {
    // Only show requests that have a generated document
    generated_documents: { isNot: null }
  };

  if (service_id) {
    where.service_id = BigInt(service_id);
  }

  if (q) {
    where.OR = [
      { request_number: { contains: q, mode: 'insensitive' } },
      { profiles: { full_name: { contains: q, mode: 'insensitive' } } },
    ];
  }

  // Fetch data and count in parallel
  const [rawRequests, totalCount] = await Promise.all([
    prisma.service_requests.findMany({
      where,
      select: {
        id: true,
        request_number: true,
        status: true,
        created_at: true,
        profiles: {
          select: { full_name: true },
        },
        services: {
          select: { id: true, name: true },
        },
        service_items: {
          select: { name: true },
        },
        generated_documents: true,
      },
      orderBy: { created_at: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.service_requests.count({ where }),
  ]);

  // Fetch list of services for the filter dropdown
  const rawServices = await prisma.services.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const requests = serializeBigInt(rawRequests);
  const services = serializeBigInt(rawServices);
  const totalPages = Math.ceil(totalCount / pageSize);

  // Generate signed URLs for existing documents
  const urlEntries = await Promise.all(
    requests.map(async (request: any) => ({
      id: request.id,
      url: await getSignedUrl(request.generated_documents?.file_path),
    })),
  );

  const urlMap = Object.fromEntries(
    urlEntries.map((item) => [item.id, item.url]),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dokumen Hasil"
        description="Kelola dokumen PDF hasil layanan. Anda dapat mencari, melihat, dan mengunduh dokumen resmi yang telah diterbitkan untuk pemohon."
        icon={FileOutput}
        actions={
          <ReportExportButton 
            type="documents"
            where={where}
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
          service_id={service_id}
        />
        
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
