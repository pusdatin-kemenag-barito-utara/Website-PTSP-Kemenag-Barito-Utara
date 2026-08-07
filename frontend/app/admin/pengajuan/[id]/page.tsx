import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { fetchAPI } from "@/lib/api";
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

// Normalize data dari Golang API agar kompatibel dengan komponen yang mengharapkan
// struktur Drizzle (request.profiles.fullName, request.services.name, dst.)
function normalizeRequest(raw: any): any {
  return {
    ...raw,
    // Profiles compatibility
    profiles: {
      id: raw.user_id,
      fullName: raw.applicant_name || null,
      email: raw.applicant_email || null,
    },
    // Services compatibility
    services: {
      name: raw.service_name || null,
      roleOwner: raw.role_owner || null,
      category: raw.category || null,
    },
    // ServiceItems compatibility
    serviceItems: {
      name: raw.item_name || null,
    },
    // Answers → serviceRequestAnswers compatibility
    serviceRequestAnswers: (raw.answers || []).map((a: any) => ({
      fieldName: a.field_name,
      fieldValue: a.field_value,
      createdAt: raw.created_at,
    })),
    // Documents → serviceRequestDocuments compatibility
    serviceRequestDocuments: (raw.documents || []).map((d: any) => ({
      id: d.id,
      fileName: d.file_name,
      filePath: d.file_path,
      fileType: d.file_type,
      fileSize: d.file_size,
      serviceRequirements: null,
    })),
    // Reviews
    serviceRequestReviews: (raw.reviews || []).map((r: any) => ({
      ...r,
      profiles: { fullName: r.reviewer_name || null },
    })),
    // Activity logs
    activityLogs: raw.activity_logs || [],
    // Generated documents
    generatedDocuments: raw.generated_documents || [],
    // Request number
    requestNumber: raw.request_number,
  };
}

export default async function AdminRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const adminProfile = await requirePermission("pengajuan");
  const { id } = await params;

  // Fetch data detail permohonan dari Golang backend
  let rawData: any;
  try {
    const res = await fetchAPI<any>(`/admin/requests/${id}`);
    rawData = res?.data;
  } catch {
    notFound();
  }

  if (!rawData) notFound();

  const request = normalizeRequest(rawData);

  // Cek otorisasi berdasarkan bidang
  const isSuper = isSuperAdmin(adminProfile.email);
  const specificRole = getAdminSpecificRole(adminProfile.email, adminProfile.role ?? "");
  const isGeneralAdmin = specificRole === "admin_ptsp";

  if (
    !isSuper &&
    !isGeneralAdmin &&
    request.services?.roleOwner &&
    request.services?.roleOwner !== specificRole
  ) {
    notFound();
  }

  // Data cuti (jika permohonan adalah cuti ASN)
  let cutiData: any = null;
  let pejabatList: any[] = [];
  if (request.services?.name?.toLowerCase().includes("cuti")) {
    try {
      const cutiRes = await fetchAPI<any>(`/pegawai/cuti?request_id=${id}`);
      if (cutiRes?.data) {
        cutiData = cutiRes.data;
      }
    } catch {
      // Data cuti tidak wajib ada, abaikan error
    }

    const pejabatRes = await getPejabatList();
    if (pejabatRes.success) {
      pejabatList = pejabatRes.data || [];
    }
  }

  // Generate signed URLs untuk dokumen
  const docUrls = await Promise.all(
    (request.serviceRequestDocuments ?? []).map(async (doc: any) => ({
      id: doc.id,
      url: await getSignedUrl("request-documents", doc.filePath),
    })),
  );

  // Generated document (ambil yang terakhir)
  const allGeneratedDocs: any[] = Array.isArray(request.generatedDocuments)
    ? request.generatedDocuments
    : request.generatedDocuments
      ? [request.generatedDocuments]
      : [];

  const generatedDoc =
    allGeneratedDocs.length > 0
      ? allGeneratedDocs[allGeneratedDocs.length - 1]
      : null;

  const generatedUrl = generatedDoc?.filePath
    ? await getSignedUrl("generated-documents", generatedDoc.filePath)
    : null;

  const signedUrlMap = new Map(docUrls.map((item: any) => [item.id, item.url]));

  const isAsn =
    request.services?.category === "asn" ||
    request.requestNumber?.startsWith("ASN");
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
