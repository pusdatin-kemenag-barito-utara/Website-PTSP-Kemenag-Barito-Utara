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

export const revalidate = 0;

async function getSignedUrl(bucket: string, path?: string | null) {
  if (!path) return null;

  // Handle R2 links
  if (isR2Path(path)) {
    return getR2SignedUrl(path);
  }

  // Handle direct HTTP / HTTPS links
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Handle Golang Backend local disk uploads (/uploads/...)
  if (path.startsWith("/uploads/") || path.startsWith("uploads/")) {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `http://127.0.0.1:8080${cleanPath}`;
  }

  try {
    const admin = createAdminClient();
    const { data } = await admin.storage.from(bucket).createSignedUrl(path, 3600);
    return data?.signedUrl || null;
  } catch {
    return null;
  }
}

// Normalize data dari Golang API agar kompatibel dengan komponen yang mengharapkan
// struktur Drizzle (request.profiles.fullName, request.services.name, dst.)
function normalizeRequest(raw: any): any {
  if (!raw) return {};

  const applicantName = raw.applicant_name || raw.applicantName || raw.user_name || raw.profiles?.fullName || raw.profiles?.full_name || "-";
  const applicantEmail = raw.applicant_email || raw.applicantEmail || raw.user_email || raw.profiles?.email || "";
  const serviceName = raw.service_name || raw.serviceName || raw.services?.name || raw.service?.name || "-";
  const roleOwner = raw.role_owner || raw.roleOwner || raw.services?.roleOwner || raw.services?.role_owner || "";
  const category = raw.category || raw.services?.category || "public";
  const itemName = raw.item_name || raw.itemName || raw.serviceItems?.name || raw.serviceItem?.name || "-";
  const requestNumber = raw.request_number || raw.requestNumber || raw.requestNo || raw.request_no || "-";
  const createdAt = raw.created_at || raw.createdAt || raw.submitted_at || raw.submittedAt;

  return {
    ...raw,
    id: raw.id,
    status: raw.status || "SUBMITTED",
    requestNumber,
    createdAt,
    // Profiles compatibility
    profiles: {
      id: raw.user_id || raw.userId,
      fullName: applicantName,
      email: applicantEmail,
    },
    // Services compatibility
    services: {
      name: serviceName,
      roleOwner,
      category,
    },
    // ServiceItems compatibility
    serviceItems: {
      name: itemName,
    },
    // Answers → serviceRequestAnswers compatibility
    serviceRequestAnswers: (() => {
      const rawAnswers = raw.answers || raw.serviceRequestAnswers || raw.request_answers || [];
      let parsed: any[] = [];
      let startDateRange = "";
      let endDateRange = "";

      const toDDMMYYYY = (dateStr: string) => {
        if (!dateStr || dateStr === "-") return "-";
        const m = dateStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
        return m ? `${m[3]}-${m[2]}-${m[1]}` : dateStr;
      };

      rawAnswers.forEach((a: any, idx: number) => {
        const fn = (a.field_name || a.fieldName || a.name || "").toString();
        let fv = (a.field_value || a.fieldValue || a.value || "-").toString();

        if (fn.toLowerCase().includes("tanggal") || fn.toLowerCase().includes("tgl")) {
          if (fv.includes(",")) {
            const parts = fv.split(",").map((s: string) => s.trim()).filter(Boolean);
            if (parts.length > 0) {
              startDateRange = parts[0];
              endDateRange = parts[parts.length - 1];
              if (fn.toLowerCase().includes("mulai")) {
                fv = `${toDDMMYYYY(parts[0])} s/d ${toDDMMYYYY(parts[parts.length - 1])}`;
              }
            }
          } else {
            fv = toDDMMYYYY(fv);
          }
        }

        parsed.push({
          id: a.id || `ans-${idx}-${fn}`,
          fieldName: fn,
          fieldValue: fv,
          createdAt,
        });
      });

      if (endDateRange) {
        const formattedEnd = toDDMMYYYY(endDateRange);
        const hasSelesai = parsed.some((item) => item.fieldName.toLowerCase().includes("selesai"));
        if (hasSelesai) {
          parsed = parsed.map((item) => {
            if (item.fieldName.toLowerCase().includes("selesai") && (item.fieldValue === "-" || item.fieldValue.includes(","))) {
              return { ...item, fieldValue: formattedEnd };
            }
            return item;
          });
        } else {
          parsed.push({
            id: "ans-derived-selesai",
            fieldName: "TANGGAL SELESAI CUTI",
            fieldValue: formattedEnd,
            createdAt,
          });
        }
      }

      return parsed;
    })(),
    // Documents → serviceRequestDocuments compatibility
    serviceRequestDocuments: (raw.documents || raw.serviceRequestDocuments || raw.request_documents || []).map((d: any) => ({
      id: d.id,
      fileName: d.file_name || d.fileName || d.name || "Dokumen",
      filePath: d.file_path || d.filePath || d.url || "",
      fileType: d.file_type || d.fileType || "pdf",
      fileSize: d.file_size || d.fileSize || 0,
      serviceRequirements: null,
    })),
    // Reviews
    serviceRequestReviews: (raw.reviews || raw.serviceRequestReviews || []).map((r: any) => ({
      ...r,
      profiles: { fullName: r.reviewer_name || r.reviewerName || r.profiles?.fullName || null },
    })),
    // Activity logs
    activityLogs: raw.activity_logs || raw.activityLogs || [],
    // Generated documents
    generatedDocuments: raw.generated_documents || raw.generatedDocuments || [],
  };
}

export default async function AdminRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const adminProfile = await requirePermission("pengajuan");
  const { id } = await params;

  let rawData: any;
  try {
    const res = await fetchAPI<any>(`/admin/requests/${id}`);
    if (res && res.success && res.data) {
      rawData = res.data;
    }
  } catch {
    // ignore to trigger notFound below
  }

  if (!rawData) {
    notFound();
  }

  const request = normalizeRequest(rawData);

  // Cek otorisasi berdasarkan bidang
  const isSuper = isSuperAdmin(adminProfile.email) || adminProfile.role === "super_admin";
  const specificRole = getAdminSpecificRole(adminProfile.email, adminProfile.role ?? "");
  const isGeneralAdmin = specificRole === "admin_ptsp" || adminProfile.role === "admin_ptsp";

  if (
    !isSuper &&
    !isGeneralAdmin &&
    request.services?.roleOwner &&
    request.services?.roleOwner !== specificRole &&
    request.services?.roleOwner !== adminProfile.role
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
