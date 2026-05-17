"use client";

import { ShieldCheck, Download, Info } from "lucide-react";

interface OutputDocumentCardProps {
  generatedUrl: string | null;
}

export function OutputDocumentCard({ generatedUrl }: OutputDocumentCardProps) {
  return (
    <div
      className={`rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative overflow-hidden group ${generatedUrl ? "bg-emerald-900" : "bg-slate-900"}`}
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
  );
}
