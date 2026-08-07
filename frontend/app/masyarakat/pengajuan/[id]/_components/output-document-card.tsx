"use client";

import { ShieldCheck, Download, Info } from "lucide-react";

interface OutputDocumentCardProps {
  generatedUrl: string | null;
}

export function OutputDocumentCard({ generatedUrl }: OutputDocumentCardProps) {
  if (!generatedUrl) return null;

  return (
    <div className="rounded-2xl p-5 sm:p-6 shadow-sm bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-900/60 transition-colors">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 shrink-0">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
            Dokumen Hasil Pelayanan
          </h3>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            Dokumen resmi telah terbit dan dapat diunduh.
          </p>
        </div>
      </div>

      <a
        href={generatedUrl}
        target="_blank"
        rel="noreferrer"
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
      >
        <Download className="h-4 w-4" />
        <span>Unduh Dokumen PDF Resmi</span>
      </a>
    </div>
  );
}
