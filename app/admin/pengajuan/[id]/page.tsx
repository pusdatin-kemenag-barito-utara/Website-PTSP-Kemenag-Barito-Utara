import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import prisma, { serializeBigInt } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { getDrivePreviewUrl } from "@/lib/google-drive";
import { FormAnswersCard } from "@/components/admin/pengajuan/form-answers-card";
import { RequestDocumentsCard } from "@/components/admin/pengajuan/request-documents-card";
import { ResultDocumentCard } from "@/components/admin/pengajuan/result-document-card";
import { ReviewActionCard } from "@/components/admin/pengajuan/review-action-card";
import { HistoryTimelineCard } from "@/components/admin/pengajuan/history-timeline-card";
import { ArrowLeft, User, Calendar, Hash, FileText } from "lucide-react";

import { getR2SignedUrl, isR2Path } from "@/lib/r2";

async function getSignedUrl(bucket: string, path?: string | null) {
  if (!path) return null;

  // Handle R2 links
  if (isR2Path(path)) {
    return getR2SignedUrl(path);
  }

  // Handle Google Drive links
  if (path.startsWith("gdrive:")) {
    const fileId = path.replace("gdrive:", "");
    return getDrivePreviewUrl(fileId);
  }

  const admin = createAdminClient();
  const { data } = await admin.storage.from(bucket).createSignedUrl(path, 3600);
  return data?.signedUrl || null;
}

export default async function AdminRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const adminProfile = await requireAdmin();
  const { id } = await params;

  const data = await prisma.service_requests.findUnique({
    where: { id },
    include: {
      profiles: true,
      services: {
        select: { name: true },
      },
      service_items: {
        select: { name: true },
      },
      service_request_answers: {
        orderBy: { created_at: "asc" },
      },
      service_request_documents: {
        include: {
          service_requirements: true,
        },
      },
      service_request_reviews: {
        include: {
          profiles: {
            select: { full_name: true },
          },
        },
        orderBy: { created_at: "desc" },
      },
      generated_documents: true,
      activity_logs: {
        orderBy: { created_at: "desc" },
      },
    },
  });

  if (!data) {
    notFound();
  }

  const request = serializeBigInt(data);

  const docUrls = await Promise.all(
    (request.service_request_documents ?? []).map(async (doc: any) => ({
      id: doc.id,
      url: await getSignedUrl("request-documents", doc.file_path),
    })),
  );

  // Find the manually-uploaded document (can be gdrive: or r2:)
  const rawGeneratedDocs = request.generated_documents;
  const allGeneratedDocs: any[] = Array.isArray(rawGeneratedDocs)
    ? rawGeneratedDocs
    : rawGeneratedDocs
      ? [rawGeneratedDocs]
      : [];

  // Get the most recent generated document
  const generatedDoc =
    allGeneratedDocs.length > 0
      ? allGeneratedDocs[allGeneratedDocs.length - 1]
      : null;

  // Build the preview URL using the unified getSignedUrl function
  const generatedUrl = generatedDoc?.file_path
    ? await getSignedUrl("generated-documents", generatedDoc.file_path)
    : null;

  const signedUrlMap = new Map(docUrls.map((item: any) => [item.id, item.url]));

  return (
    <div className="space-y-6 pb-12">
      {/* Back link */}
      <Link
        href="/admin/pengajuan"
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#059669] transition-all hover:-translate-x-1"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke daftar pengajuan
      </Link>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-200/50 bg-gradient-to-br from-emerald-600 to-emerald-900 shadow-xl shadow-emerald-900/10 p-8 sm:p-10">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-white/10 text-emerald-100 text-[11px] font-black tracking-widest uppercase backdrop-blur-md border border-white/10">
                Detail Pengajuan
              </span>
              <StatusBadge status={request.status} />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {request.request_number}
            </h1>
            <p className="text-emerald-200 font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 opacity-70" />
              Diajukan pada {formatDate(request.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Info Grid - Modern Glassy Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 -mt-4 relative z-20 px-4 sm:px-8">
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-[#059669]">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Pemohon
              </p>
              <p className="text-sm font-black text-slate-900 mt-0.5 line-clamp-1">
                {request.profiles?.full_name || "-"}
              </p>
              <p className="text-[11px] text-slate-500">
                {request.profiles?.email}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Layanan
              </p>
              <p className="text-sm font-black text-slate-900 mt-0.5 line-clamp-1">
                {request.services?.name}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-5 shadow-sm hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Hash className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Item Layanan
              </p>
              <p className="text-sm font-black text-slate-900 mt-0.5 line-clamp-1">
                {request.service_items?.name || "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid gap-6 lg:grid-cols-12 mt-6">
        {/* Left Column - Forms & Documents */}
        <div className="space-y-6 lg:col-span-7">
          <FormAnswersCard request={request} />
          <RequestDocumentsCard request={request} signedUrlMap={signedUrlMap} />
          <ResultDocumentCard
            request={request}
            generatedDoc={generatedDoc}
            generatedUrl={generatedUrl}
          />
        </div>

        {/* Right Column - Actions & Logs */}
        <div className="space-y-6 lg:col-span-5">
          <ReviewActionCard request={request} adminProfile={adminProfile} />
          <HistoryTimelineCard request={request} />
        </div>
      </div>
    </div>
  );
}
