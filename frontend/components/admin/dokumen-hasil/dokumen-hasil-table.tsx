"use client";

import { useState, useTransition } from "react";
import { formatDate } from "@/lib/utils";
import { FileDigit, CheckCircle2, Clock, AlertCircle, Eye, Send, FileCheck2, FileUp, Hash } from "lucide-react";
import { UploadResultButton } from "@/components/admin/upload-result-button";
import { sendResultWhatsAppAction } from "@/lib/actions/admin/admin-requests";
import { toast } from "sonner";
import { AlertDialog } from "@/components/ui/alert-dialog";

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
  const waLog = request.activityLogs?.find((log: any) => log.action === "KIRIM_WA_HASIL");
  const [isWaSent, setIsWaSent] = useState(!!waLog);
  const [waSentDate, setWaSentDate] = useState<string | null>(
    waLog?.createdAt ? formatDate(waLog.createdAt) : null
  );
  
  const isGenerated = !!request.generatedDocuments?.length || !!fileUrl;
  const docDate = request.generatedDocuments?.length ? formatDate(request.generatedDocuments[0].generatedAt) : null;
  
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

  const statusColor = request.status === "completed" 
    ? "bg-emerald-100 text-emerald-700" 
    : request.status === "under_review"
      ? "bg-blue-100 text-blue-700"
      : request.status === "rejected"
        ? "bg-red-100 text-red-700"
        : "bg-amber-100 text-amber-700";
        
  const statusLabel = request.status.replace(/_/g, " ");

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
                {request.profiles?.fullName || "Pemohon Tanpa Nama"}
                {isGenerated && (
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                    Tersedia
                  </span>
                )}
              </h3>
              <p className="text-sm font-medium text-slate-500 truncate mt-0.5">
                {request.services?.name || "Layanan PTSP"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md" title="Nomor Tiket">
                <span className="font-semibold font-mono text-slate-700">{request.request_number}</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
                  {statusLabel}
                </span>
              </div>

              {isGenerated ? (
                <div className="flex items-center gap-1.5 text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Diunggah: {docDate}
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
          
          {request.generatedDocuments?.[0]?.filePath === "EXPIRED" ? (
            <span className="flex items-center justify-center p-2 rounded-xl bg-red-50 text-red-600 border border-red-200" title="Dokumen Kadaluarsa">
              <AlertCircle className="h-4 w-4" />
            </span>
          ) : fileUrl ? (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Lihat File"
              className="flex items-center justify-center p-2 rounded-xl transition-all shadow-sm active:scale-95 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300"
            >
              <Eye className="h-4 w-4" />
            </a>
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
        description={`Apakah Anda yakin ingin mengirim dokumen hasil ke nomor WA pemohon (${request.profiles?.fullName || "Pemohon"})?`}
        onConfirm={handleConfirmSendWA}
        loading={isPending}
        confirmText="Kirim Sekarang"
        cancelText="Batal"
        variant="info"
      />
    </>
  );
}
