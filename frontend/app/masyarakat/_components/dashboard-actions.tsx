"use client";

import Link from "next/link";
import { PlusCircle, ShieldCheck } from "lucide-react";

export function DashboardActions() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        <span>Aksi Cepat Layanan</span>
      </h2>

      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        {/* Subtle Glow */}
        <div className="absolute top-0 right-0 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-2xl relative z-10">
          <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 mb-2">
            Layanan Online Kemenag
          </span>
          <h3 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
            Ingin Mengurus Dokumen Keagamaan?
          </h3>
          <p className="mt-2 text-xs sm:text-sm font-medium text-slate-300 leading-relaxed">
            Ajukan rekomendasi nikah, izin madrasah, rekomendasi tempat ibadah, atau puluhan layanan lainnya langsung dari perangkat Anda.
          </p>
        </div>

        <Link
          href="/masyarakat/pengajuan/baru"
          className="relative z-10 shrink-0 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-xs sm:text-sm px-6 shadow-lg shadow-emerald-950/50 transition-all hover:scale-[1.02] active:scale-95"
        >
          <PlusCircle className="h-4.5 w-4.5" />
          <span>Buat Pengajuan Baru</span>
        </Link>
      </div>
    </div>
  );
}
