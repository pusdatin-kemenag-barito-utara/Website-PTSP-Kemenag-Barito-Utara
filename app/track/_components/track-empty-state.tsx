"use client";

import { History } from "lucide-react";

export function TrackEmptyState() {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/60 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md p-12 md:p-16 text-center shadow-[0_12px_35px_-8px_rgba(0,0,0,0.03)] transition-colors duration-300">
      {/* Decorative inner circular glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.08] rounded-full blur-2xl pointer-events-none" />
      
      <div className="relative z-10 space-y-5">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/60 border border-emerald-100/50 dark:border-emerald-900/50 text-[#059669] dark:text-emerald-400 shadow-sm">
          <History className="h-7 w-7 animate-pulse" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Belum Ada Pencarian
          </h3>
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 max-w-sm mx-auto leading-relaxed">
            Silakan masukkan nomor pendaftaran Anda pada kolom pencarian di atas untuk memantau status berkas Anda secara real-time.
          </p>
        </div>
      </div>
    </div>
  );
}
