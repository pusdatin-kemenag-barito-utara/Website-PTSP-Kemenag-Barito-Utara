"use client";

import { Clock, CheckCircle2, AlertCircle } from "lucide-react";

export function RequestsInfoFooter() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="flex items-center gap-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs transition-colors duration-300">
        <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40">
          <Clock className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Estimasi Layanan
          </p>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">
            Verifikasi 1–3 Hari Kerja
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs transition-colors duration-300">
        <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/40">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Jaminan Akses Resmi
          </p>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">
            Dokumen Ber-Barcode TTD Elektronik
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs transition-colors duration-300">
        <div className="h-10 w-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-100 dark:border-teal-900/40">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Support Bantuan
          </p>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-0.5">
            Petugas Helpdesk Siap Membantu
          </p>
        </div>
      </div>
    </div>
  );
}
