import {
  ChevronRight,
  AlertCircle,
  FileCheck,
  Download,
  ArrowRight,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export function TrackStatusCard({
  result,
  generatedUrl,
}: {
  result: any;
  generatedUrl: string | null;
}) {
  return (
    <div className="rounded-[2rem] bg-white p-6 sm:p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-1">
            Nomor Pengajuan
          </p>
          <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">
            {result.request_number}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 inline-flex">
            <span className="text-[#059669]">{result.services?.name}</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <span>{result.service_items?.name}</span>
          </div>
        </div>
        <div className="shrink-0 scale-110 origin-left sm:origin-right">
          <StatusBadge status={result.status} />
        </div>
      </div>

      <div className="mt-8 grid gap-4 rounded-2xl bg-slate-50/80 p-5 border border-slate-100 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Tanggal Pengajuan
          </p>
          <p className="mt-1 text-sm font-bold text-slate-900">
            {formatDate(result.created_at)}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Diterima Sistem
          </p>
          <p className="mt-1 text-sm font-bold text-slate-900">
            {result.submitted_at ? formatDate(result.submitted_at) : "-"}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Disetujui
          </p>
          <p className="mt-1 text-sm font-bold text-slate-900">
            {result.approved_at ? formatDate(result.approved_at) : "-"}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Selesai
          </p>
          <p className="mt-1 text-sm font-bold text-slate-900">
            {result.completed_at ? formatDate(result.completed_at) : "-"}
          </p>
        </div>
      </div>

      {result.revision_note && (
        <div className="mt-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
          <div className="mt-0.5 shrink-0">
            <AlertCircle className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="font-bold text-amber-800">
              Catatan Revisi dari Petugas
            </p>
            <p className="mt-1 text-sm">{result.revision_note}</p>
          </div>
        </div>
      )}

      {result.rejection_reason && (
        <div className="mt-5 flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-900">
          <div className="mt-0.5 shrink-0">
            <AlertCircle className="h-5 w-5 text-rose-600" />
          </div>
          <div>
            <p className="font-bold text-rose-800">Alasan Penolakan</p>
            <p className="mt-1 text-sm">{result.rejection_reason}</p>
          </div>
        </div>
      )}

      {/* Hasil Layanan Section */}
      {(result.status === "completed" ||
        result.status === "COMPLETED" ||
        generatedUrl) && (
        <div className="mt-8 border-t border-slate-100 pt-8">
          <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-[#0f8a54]" />
            Dokumen Hasil Layanan
          </h3>
          {generatedUrl === "EXPIRED" ? (
            <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-900">
              <AlertCircle className="h-8 w-8 text-rose-600" />
              <div>
                <p className="font-bold text-rose-800">File Telah Kadaluarsa</p>
                <p className="mt-0.5 text-sm">
                  Dokumen ini telah dihapus dari sistem untuk menghemat ruang
                  penyimpanan karena sudah melewati batas waktu 3 hari.
                </p>
              </div>
            </div>
          ) : generatedUrl ? (
            <a
              href={generatedUrl}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between rounded-2xl border border-[#059669]/20 bg-[#059669]/5 p-5 transition-colors hover:bg-[#059669]/10"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#059669] text-white shadow-md">
                  <Download className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">
                    Unduh Dokumen Hasil
                  </p>
                  <p className="text-sm text-slate-600">
                    Klik untuk mengunduh berkas resmi hasil permohonan Anda.
                  </p>
                </div>
              </div>
              <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-white text-[#059669] shadow-sm transition-transform group-hover:scale-110 sm:flex">
                <ArrowRight className="h-5 w-5" />
              </div>
            </a>
          ) : (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center text-sm text-slate-500">
              Dokumen hasil belum diunggah oleh petugas.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
