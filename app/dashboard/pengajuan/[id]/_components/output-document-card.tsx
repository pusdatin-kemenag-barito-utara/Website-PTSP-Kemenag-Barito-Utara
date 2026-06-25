"use client";

import { ShieldCheck, Download, Info } from "lucide-react";

interface OutputDocumentCardProps {
  generatedUrl: string | null;
}

export function OutputDocumentCard({ generatedUrl }: OutputDocumentCardProps) {
  if (!generatedUrl) return null;

  return (
    <div
      className="rounded-2xl p-5 sm:p-6 shadow-sm bg-emerald-900 border border-emerald-800 relative overflow-hidden group"
    >

      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400/80 mb-2">
        Dokumen Output
      </p>
      <h3 className="text-xl font-black text-white leading-tight">
        Dokumen Hasil <br /> Pengajuan
      </h3>

      <div className="mt-6 space-y-4">
        <div className="flex items-center gap-3 text-emerald-100/70">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          <p className="text-xs font-medium">
            Dokumen telah terbit dan siap diunduh.
          </p>
        </div>
        <a
          href={generatedUrl}
          target="_blank"
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-500 active:scale-95"
        >
          <Download className="h-4 w-4" />
          Download PDF
        </a>
      </div>
    </div>
  );
}
