import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { db, serializeBigInt } from "@/lib/db";
import { serviceRequests as serviceRequestsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { pengajuanCuti } from "@/lib/db/schema/kepegawaian";
import { getPejabatList } from "@/lib/actions/admin/pejabat-actions";
import { createAdminClient } from "@/lib/supabase/admin";

import { FormAnswersCard } from "@/components/admin/pengajuan/form-answers-card";
import { RequestDocumentsCard } from "@/components/admin/pengajuan/request-documents-card";
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

  let cutiDataRaw: any = null;
  let pejabatList: any[] = [];
  if (request.services?.name?.toLowerCase().includes("cuti")) {
    const pCuti = await db.query.pengajuanCuti.findFirst({
      where: eq(pengajuanCuti.requestId, id)
    });
    
    // Get detailed user info
    let jabatan = "-";
    let pangkatGolongan = "-";
    let nip = request.profiles?.email?.split('@')[0] || "-";
    
    if (request.profiles?.id) {
        const userPegawaiRaw = await db.query.profilesPegawai.findFirst({
            where: (t, { eq }) => eq(t.profileId, request.profiles.id)
        });
        if (userPegawaiRaw) {
            jabatan = userPegawaiRaw.jabatan || "-";
            pangkatGolongan = userPegawaiRaw.pangkatGolongan || "-";
            if (userPegawaiRaw.nip) nip = userPegawaiRaw.nip;
        }
    }

    if (pCuti) {
        cutiDataRaw = {
            ...pCuti,
            jabatan,
            pangkatGolongan,
            nip
        };
    }

    const pejabatRes = await getPejabatList();
    if (pejabatRes.success) {
      pejabatList = pejabatRes.data || [];
    }
  }

  const cutiData = cutiDataRaw ? serializeBigInt(cutiDataRaw) : null;

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

  const isAsn = request.services?.category === "asn" || request.requestNumber?.startsWith("ASN");
  const backUrl = isAsn ? "/admin/pengajuan?type=asn" : "/admin/pengajuan";

  return (
    <div className="space-y-6 pb-12">
      <RealtimeSync />
      {/* Back link */}
      <Link
        href={backUrl}
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#059669] transition-all hover:-translate-x-1"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke daftar pengajuan
      </Link>

      <AdminDetailHeader request={request} cutiData={cutiData} pejabatList={pejabatList} />
      <AdminDetailInfoGrid request={request} />

      {/* Main Content Layout */}
      <div className="grid gap-6 lg:grid-cols-12 mt-6">
        {/* Left Column - Forms & Documents */}
        <div className="space-y-6 lg:col-span-7">
          <FormAnswersCard request={request} />
          <RequestDocumentsCard request={request} signedUrlMap={signedUrlMap} />
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
