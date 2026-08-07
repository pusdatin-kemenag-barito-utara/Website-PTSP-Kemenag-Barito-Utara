"use client";

import Link from "next/link";
import { PlusCircle, FileText, Sparkles } from "lucide-react";

export function RequestsHeader() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.25rem] bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/80 p-6 sm:p-8 md:p-10 text-white shadow-xl dark:shadow-none border border-emerald-800/50 dark:border-slate-800 transition-colors duration-300">
      {/* Subtle Background Radial Glow */}
      <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-emerald-500/15 dark:bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 dark:bg-emerald-950/80 border border-white/20 dark:border-emerald-800/60 px-3.5 py-1 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 dark:text-emerald-300">
              Riwayat Permohonan Saya
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Daftar Berkas Pengajuan
          </h1>

          <p className="text-xs sm:text-sm font-medium text-emerald-100/80 dark:text-slate-300 leading-relaxed">
            Pantau perkembangan proses verifikasi, tanggapan revisi, dan unduh dokumen hasil pelayanan keagamaan Anda.
          </p>
        </div>

        <div className="shrink-0">
          <Link
            href="/masyarakat/pengajuan/baru"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm px-5 py-3 shadow-lg shadow-emerald-950/30 transition-all hover:scale-[1.02] active:scale-95"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Buat Pengajuan Baru</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
