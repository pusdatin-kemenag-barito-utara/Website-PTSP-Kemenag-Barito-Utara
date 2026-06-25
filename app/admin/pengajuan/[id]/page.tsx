import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { db, serializeBigInt } from "@/lib/db";
import { serviceRequests as serviceRequestsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createAdminClient } from "@/lib/supabase/admin";

import { FormAnswersCard } from "@/components/admin/pengajuan/form-answers-card";
import { RequestDocumentsCard } from "@/components/admin/pengajuan/request-documents-card";
import { ResultDocumentCard } from "@/components/admin/pengajuan/result-document-card";
import { ReviewActionCard } from "@/components/admin/pengajuan/review-action-card";
import { HistoryTimelineCard } from "@/components/admin/pengajuan/history-timeline-card";
import { ArrowLeft } from "lucide-react";

import { getR2SignedUrl, isR2Path } from "@/lib/r2";
import { RealtimeSync } from "@/components/ui/realtime-sync";
import { isSuperAdmin, getAdminSpecificRole } from "@/lib/constants";

// Local Components
import { AdminDetailHeader } from "./_components/admin-detail-header";
import { AdminDetailInfoGrid } from "./_components/admin-detail-info-grid";

async function getSignedUrl(bucket: string, path?: string | null) {
  if (!path) return null;

  // Handle R2 links
  if (isR2Path(path)) {
    return getR2SignedUrl(path);
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
  const adminProfile = await requirePermission("pengajuan");
  const { id } = await params;

  const dataFinal = await db.query.serviceRequests.findFirst({
    where: eq(serviceRequestsTable.id, id),
    with: {
      profiles: true,
      services: { columns: { name: true, roleOwner: true, category: true } },
      serviceItems: { columns: { name: true } },
      serviceRequestAnswers: {
        orderBy: (answers, { asc }) => [asc(answers.createdAt)],
      },
      serviceRequestDocuments: {
        with: { serviceRequirements: true },
      },
      serviceRequestReviews: {
        with: { profiles: { columns: { fullName: true } } },
        orderBy: (reviews, { desc }) => [desc(reviews.createdAt)],
      },
      generatedDocuments: true,
      activityLogs: {
        orderBy: (logs, { desc }) => [desc(logs.createdAt)],
      },
    },
  });

  if (!dataFinal) {
    notFound();
  }

  // Cek otorisasi berdasarkan bidang
  const isSuper = isSuperAdmin(adminProfile.email);
  const specificRole = getAdminSpecificRole(adminProfile.email, adminProfile.role ?? "");
  const isGeneralAdmin = specificRole === "admin_ptsp";

  if (!isSuper && !isGeneralAdmin && dataFinal.services?.roleOwner && dataFinal.services?.roleOwner !== specificRole) {
    notFound();
  }

  // Manual sorting to ensure consistent UI
  const requestRaw = {
    ...dataFinal,
    serviceRequestAnswers: [...(dataFinal.serviceRequestAnswers || [])].sort(
      (a, b) =>
        new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime(),
    ),
    serviceRequestReviews: [...(dataFinal.serviceRequestReviews || [])].sort(
      (a, b) =>
        new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime(),
    ),
    activityLogs: [...(dataFinal.activityLogs || [])].sort(
      (a, b) =>
        new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime(),
    ),
  };

  const request = serializeBigInt(requestRaw);

  const docUrls = await Promise.all(
    (request.serviceRequestDocuments ?? []).map(async (doc: any) => ({
      id: doc.id,
      url: await getSignedUrl("request-documents", doc.filePath),
    })),
  );

  const rawGeneratedDocs = request.generatedDocuments;
  const allGeneratedDocs: any[] = Array.isArray(rawGeneratedDocs)
    ? rawGeneratedDocs
    : rawGeneratedDocs
      ? [rawGeneratedDocs]
      : [];

  const generatedDoc =
    allGeneratedDocs.length > 0
      ? allGeneratedDocs[allGeneratedDocs.length - 1]
      : null;

  const generatedUrl = generatedDoc?.filePath
    ? await getSignedUrl("generated-documents", generatedDoc.filePath)
    : null;

  const signedUrlMap = new Map(docUrls.map((item: any) => [item.id, item.url]));

  return (
    <div className="space-y-6 pb-12">
      <RealtimeSync />
      {/* Back link */}
      <Link
        href="/admin/pengajuan"
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#059669] transition-all hover:-translate-x-1"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke daftar pengajuan
      </Link>

      <AdminDetailHeader request={request} />
      <AdminDetailInfoGrid request={request} />

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
