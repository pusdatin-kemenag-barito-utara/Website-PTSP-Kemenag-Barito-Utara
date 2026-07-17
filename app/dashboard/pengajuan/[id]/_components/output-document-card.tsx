"use client";

import { ShieldCheck, Download, Info } from "lucide-react";

interface OutputDocumentCardProps {
  generatedUrl: string | null;
}

export function OutputDocumentCard({ generatedUrl }: OutputDocumentCardProps) {
  if (!generatedUrl) return null;

  return (
    <div className="rounded-xl p-6 shadow-sm bg-white border border-slate-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900 leading-tight">
            Dokumen Hasil
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Dokumen telah terbit dan siap diunduh.
          </p>
        </div>
      </div>

      <a
        href={generatedUrl}
        target="_blank"
        className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 active:scale-95"
      >
        <Download className="h-4 w-4" />
        Unduh Dokumen PDF
      </a>
    </div>
  );
}
