import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import prisma, { serializeBigInt } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { getDrivePreviewUrl } from "@/lib/google-drive";
import { UploadRevisionForm } from "@/components/forms/upload-revision-form";
import { EditAnswersDialog } from "@/components/dashboard/edit-answers-dialog";
import { DeleteRequestButton } from "@/components/dashboard/delete-request-button";
import { CopyButton } from "@/components/ui/copy-button";
import {
  ArrowLeft,
  FileCheck,
  History as HistoryIcon,
  ClipboardList,
  FileText,
  Download,
  AlertCircle,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Info,
} from "lucide-react";

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

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await requireAuth();
  const { id } = await params;

  const data = await prisma.service_requests.findUnique({
    where: {
      id: id,
      user_id: profile.id, // Ensure user owns the request
    },
    include: {
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

  const generatedDoc = Array.isArray(request.generated_documents)
    ? request.generated_documents[0]
    : request.generated_documents;

  const generatedUrl =
    generatedDoc?.file_path && request.status === "completed"
      ? await getSignedUrl("generated-documents", generatedDoc.file_path)
      : null;

  const signedUrlMap = new Map(docUrls.map((item: any) => [item.id, item.url]));

  const rawRequirements = await prisma.service_requirements.findMany({
    where: { service_item_id: BigInt(request.service_item_id) },
    orderBy: { id: "asc" },
  });

  const requirements = serializeBigInt(rawRequirements);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Navigation & Header */}
      <div className="flex flex-col gap-4">
        <Link
          href="/dashboard/pengajuan"
          className="group inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-[#059669] transition-colors"
        >
          <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
          Kembali ke Riwayat
        </Link>

        <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#064e3b] via-[#059669] to-[#047857] p-8 md:p-12 shadow-[0_20px_50px_-20px_rgba(4,120,87,0.4)]">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl animate-pulse" />

          <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 backdrop-blur-md">
                  <h1 className="text-2xl font-black text-white tracking-tighter">
                    {request.request_number}
                  </h1>
                  <CopyButton
                    text={request.request_number}
                    className="text-white hover:bg-white/10"
                  />
                </div>
                <StatusBadge
                  status={request.status}
                  className="h-9 px-4 text-[10px] font-black uppercase tracking-widest ring-2 ring-white shadow-lg"
                />
              </div>

              <div>
                <h2 className="text-xl font-black text-emerald-50 md:text-2xl tracking-tight leading-tight">
                  {request.services?.name}
                </h2>
                <p className="mt-2 text-sm font-medium text-emerald-100/60 max-w-2xl leading-relaxed">
                  {request.service_items?.name}
                </p>
              </div>

              <div className="flex flex-wrap gap-6 pt-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200/50">
                    Diajukan
                  </span>
                  <span className="text-xs font-black text-white">
                    {formatDate(request.created_at)}
                  </span>
                </div>
                {request.approved_at && (
                  <div className="flex flex-col gap-1 border-l border-white/10 pl-6">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200/50">
                      Disetujui
                    </span>
                    <span className="text-xs font-black text-white">
                      {formatDate(request.approved_at)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="shrink-0 pb-1">
              <DeleteRequestButton
                requestId={request.id}
                status={request.status}
              />
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {/* Detail Pengajuan Card */}
          <div className="rounded-[2.5rem] bg-white p-8 shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Info className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Detail Pengajuan
              </h3>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                    Catatan Revisi
                  </p>
                  <p
                    className={`text-sm font-bold ${request.revision_note ? "text-rose-600" : "text-slate-500 italic"}`}
                  >
                    {request.revision_note || "Tidak ada catatan revisi"}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                    Alasan Penolakan
                  </p>
                  <p
                    className={`text-sm font-bold ${request.rejection_reason ? "text-rose-700" : "text-slate-500 italic"}`}
                  >
                    {request.rejection_reason || "Tidak ada alasan penolakan"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Jawaban Form Card */}
          <div className="rounded-[2.5rem] bg-white p-8 shadow-2xl shadow-slate-200/50 border border-slate-100">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Jawaban Form
                </h3>
              </div>
              <EditAnswersDialog
                requestId={request.id}
                answers={request.service_request_answers ?? []}
                documents={request.service_request_documents ?? []}
                disabled={
                  !["submitted", "under_review", "revision_required"].includes(
                    request.status,
                  )
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {(request.service_request_answers ?? []).map((answer: any) => (
                <div
                  key={answer.id}
                  className="rounded-2xl bg-slate-50 p-5 group hover:bg-slate-100 transition-colors"
                >
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 group-hover:text-slate-500 transition-colors">
                    {answer.field_name}
                  </p>
                  <p className="text-sm font-bold text-slate-800 break-words leading-relaxed">
                    {answer.field_value || "-"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Dokumen Persyaratan Card */}
          <div className="rounded-[2.5rem] bg-white p-8 shadow-2xl shadow-slate-200/50 border border-slate-100">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Dokumen Persyaratan
              </h3>
            </div>

            <div className="space-y-3">
              {(request.service_request_documents ?? []).map((doc: any) => (
                <div
                  key={doc.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-slate-50 p-5 hover:bg-emerald-50/50 hover:border-emerald-100 border border-transparent transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors shadow-sm">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800 tracking-tight leading-none mb-1">
                        {doc.service_requirements?.document_name ||
                          doc.file_name}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 truncate max-w-[200px]">
                        {doc.file_name}
                      </p>
                    </div>
                  </div>
                  {signedUrlMap.get(doc.id) && (
                    <a
                      href={signedUrlMap.get(doc.id)!}
                      target="_blank"
                      className="inline-flex items-center gap-2 h-10 px-6 rounded-xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-emerald-600 hover:text-emerald-600 transition-all shadow-sm"
                    >
                      Preview <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              ))}

              {!request.service_request_documents?.length && (
                <div className="py-12 text-center">
                  <AlertCircle className="mx-auto h-8 w-8 text-slate-200 mb-3" />
                  <p className="text-sm font-bold text-slate-400">
                    Belum ada dokumen terupload.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Dokumen Hasil Card */}
          <div
            className={`rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group ${generatedUrl ? "bg-emerald-900" : "bg-slate-900"}`}
          >
            <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl transition-all duration-700" />

            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400/80 mb-2">
              Dokumen Output
            </p>
            <h3 className="text-xl font-black text-white leading-tight">
              Dokumen Hasil <br /> Pengajuan
            </h3>

            {generatedUrl ? (
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 text-emerald-100/70">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  <p className="text-xs font-medium">
                    Dokumen telah terbit dan siap diunduh.
                  </p>
                </div>
                <a
                  href={generatedUrl}
                  target="_blank"
                  className="flex h-14 items-center justify-center gap-3 rounded-2xl bg-emerald-600 font-black text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-500 hover:shadow-emerald-500/40 active:scale-95"
                >
                  <Download className="h-5 w-5" />
                  Download PDF
                </a>
              </div>
            ) : (
              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3 text-slate-400">
                  <Info className="h-5 w-5 text-slate-500 shrink-0" />
                  <p className="text-xs font-medium leading-relaxed italic">
                    Dokumen hasil belum tersedia. Dokumen akan muncul di sini
                    setelah admin menyetujui permohonan.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Upload Revisi Card */}
          {request.status === "revision_required" && (
            <div className="rounded-[2.5rem] bg-rose-50 border-2 border-rose-100 p-8 shadow-xl">
              <div className="mb-6 flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-rose-500" />
                <h3 className="text-lg font-black text-rose-900 tracking-tight">
                  Upload Revisi
                </h3>
              </div>
              <p className="text-xs font-medium text-rose-700 leading-relaxed mb-8">
                Harap perbaiki dokumen Anda sesuai dengan catatan revisi dari
                petugas di atas.
              </p>
              <div className="space-y-6">
                {(requirements ?? []).map((requirement: any) => (
                  <UploadRevisionForm
                    key={requirement.id}
                    requestId={request.id}
                    requirement={requirement}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Riwayat Aktivitas Card */}
          <div className="rounded-[2.5rem] bg-white p-8 shadow-2xl shadow-slate-200/50 border border-slate-100">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                <HistoryIcon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Log Aktivitas
              </h3>
            </div>

            <div className="space-y-6">
              {(request.activity_logs ?? []).map((log: any, idx: number) => (
                <div key={log.id} className="relative pl-8 group">
                  {/* Timeline line */}
                  {idx !== request.activity_logs?.length - 1 && (
                    <div className="absolute left-[15px] top-[26px] bottom-[-20px] w-0.5 bg-slate-100" />
                  )}
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-1.5 h-8 w-8 rounded-full bg-slate-50 border-4 border-white shadow-sm flex items-center justify-center group-hover:bg-emerald-50 group-hover:border-emerald-50 transition-colors">
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-300 group-hover:bg-emerald-500 transition-colors" />
                  </div>

                  <p className="text-xs font-black text-slate-800 tracking-tight group-hover:text-emerald-700 transition-colors">
                    {log.action}
                  </p>
                  <p className="text-[10px] font-medium text-slate-500 leading-relaxed mt-1">
                    {log.notes || "Sistem memproses status otomatis"}
                  </p>
                  <p className="mt-2 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-300">
                    <Calendar className="h-2.5 w-2.5" />
                    {formatDate(log.created_at)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
