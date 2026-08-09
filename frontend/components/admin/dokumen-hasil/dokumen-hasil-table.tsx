"use client";

import { useState, useTransition } from "react";
import { formatDate } from "@/lib/utils";
import { FileDigit, CheckCircle2, Clock, AlertCircle, Eye, Send, FileCheck2, FileUp, Hash } from "lucide-react";
import { UploadResultButton } from "@/components/admin/upload-result-button";
import { sendResultWhatsAppAction } from "@/lib/actions/admin/admin-requests";
import { toast } from "sonner";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { FloatingDocViewerModal } from "@/components/ui/floating-doc-viewer-modal";

export function DokumenHasilTable({
  paginatedRequests,
  urlMap,
}: {
  paginatedRequests: any[];
  urlMap: Record<string, string | null>;
}) {
  if (paginatedRequests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-400 mb-4">
          <FileDigit className="h-8 w-8" />
        </div>
        <p className="text-sm font-semibold text-slate-700">
          Tidak ada dokumen ditemukan
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Coba gunakan kata kunci pencarian yang lain.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {paginatedRequests.map((request: any) => (
        <DokumenHasilRow 
          key={request.id}
          request={request}
          fileUrl={urlMap[request.id]}
        />
      ))}
    </div>
  );
}

function DokumenHasilRow({ request, fileUrl }: { request: any, fileUrl: string | null }) {
  const [isPending, startTransition] = useTransition();
  const [showWADialog, setShowWADialog] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  const applicantName =
    request.applicant_name ||
    request.applicantName ||
    request.profiles?.fullName ||
    request.profiles?.name ||
    request.name ||
    "Pemohon Tanpa Nama";

  const serviceName =
    request.service_name ||
    request.serviceName ||
    request.services?.name ||
    request.item_name ||
    request.itemName ||
    "Layanan PTSP";

  const reqNum = request.request_number || request.requestNumber || request.requestNo || "-";

  const waLog = request.activityLogs?.find((log: any) => log.action === "KIRIM_WA_HASIL");
  const [isWaSent, setIsWaSent] = useState(!!waLog);
  const [waSentDate, setWaSentDate] = useState<string | null>(
    waLog?.createdAt || waLog?.created_at ? formatDate(waLog.createdAt || waLog.created_at) : null
  );
  
  const generatedDocs = request.generated_documents || request.generatedDocuments || [];
  const isGenerated = !!generatedDocs.length || !!fileUrl;
  const docDate = generatedDocs.length ? formatDate(generatedDocs[0].generatedAt || generatedDocs[0].generated_at || request.updated_at || request.updatedAt) : null;
  
  const handleConfirmSendWA = () => {
    setShowWADialog(false);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("requestId", request.id);
      
      const result = await sendResultWhatsAppAction(formData);
      if (result.success) {
        toast.success(result.message || "Pesan WhatsApp berhasil dikirim");
        setIsWaSent(true);
        setWaSentDate(formatDate(new Date().toISOString()));
      } else {
        toast.error(result.error || "Gagal mengirim pesan WhatsApp");
      }
    });
  };

  const currentStatus = (request.status || "").toLowerCase();
  const statusColor = currentStatus === "completed" || currentStatus === "selesai"
    ? "bg-emerald-100 text-emerald-700" 
    : currentStatus === "under_review" || currentStatus === "sedang ditinjau"
      ? "bg-blue-100 text-blue-700"
      : currentStatus === "rejected" || currentStatus === "ditolak"
        ? "bg-red-100 text-red-700"
        : "bg-amber-100 text-amber-700";
        
  const statusLabel = request.status ? request.status.replace(/_/g, " ").toUpperCase() : "SELESAI";

  return (
    <>
      <div className="p-5 transition-colors hover:bg-slate-50/50 flex flex-col lg:flex-row gap-6 lg:items-center justify-between border-b border-slate-100 last:border-0 group">
        {/* Info Permohonan */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-sm border ${
              isGenerated
                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                : "bg-amber-50 text-amber-600 border-amber-100"
            }`}
          >
            {isGenerated ? (
              <FileCheck2 className="h-7 w-7" />
            ) : (
              <FileUp className="h-7 w-7" />
            )}
          </div>
          
          <div className="min-w-0 space-y-2">
            <div>
              <h3 className="font-bold text-slate-900 text-base truncate flex items-center gap-2">
                {applicantName}
                {isGenerated && (
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                    Tersedia
                  </span>
                )}
              </h3>
              <p className="text-sm font-medium text-slate-500 truncate mt-0.5">
                {serviceName}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md" title="Nomor Tiket">
                <span className="font-semibold font-mono text-slate-700">{reqNum}</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
                  {statusLabel}
                </span>
              </div>

              {isGenerated ? (
                <div className="flex items-center gap-1.5 text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {docDate ? `Diunggah: ${docDate}` : "Dokumen Hasil Siap"}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-amber-600 font-semibold bg-amber-50 px-2.5 py-1 rounded-md border border-amber-100">
                  <Clock className="h-3.5 w-3.5" />
                  Menunggu Unggahan Dokumen
                </div>
              )}

              {isWaSent && (
                <div className="flex items-center gap-1.5 text-indigo-600 font-semibold bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100 animate-in fade-in zoom-in duration-300">
                  <Send className="h-3 w-3" />
                  {waSentDate ? `Terkirim ke WA: ${waSentDate}` : "Terkirim ke WA"}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 ml-[4.5rem] lg:ml-0">
          <UploadResultButton requestId={request.id} hasFile={isGenerated} />
          
          {fileUrl ? (
            <button
              type="button"
              onClick={() => setIsDocModalOpen(true)}
              title="Lihat Dokumen Hasil"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all shadow-sm active:scale-95 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
            >
              <Eye className="h-4 w-4" />
              <span>Buka File</span>
            </button>
          ) : null}

          {isGenerated && (
            <button
              onClick={() => setShowWADialog(true)}
              disabled={isPending}
              className="flex items-center justify-center p-2 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300"
              title="Kirim notifikasi via WhatsApp"
            >
              <Send className={`h-4 w-4 ${isPending ? 'animate-pulse' : ''}`} />
            </button>
          )}
        </div>
      </div>

      <AlertDialog
        open={showWADialog}
        onOpenChange={setShowWADialog}
        title="Kirim Dokumen via WhatsApp"
        description={`Apakah Anda yakin ingin mengirim dokumen hasil ke nomor WA pemohon (${applicantName})?`}
        onConfirm={handleConfirmSendWA}
        loading={isPending}
        confirmText="Kirim Sekarang"
        cancelText="Batal"
        variant="info"
      />

      <FloatingDocViewerModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        title={serviceName}
        url={fileUrl}
        fileName={`Dokumen_Hasil_${reqNum}.pdf`}
      />
    </>
  );
}
