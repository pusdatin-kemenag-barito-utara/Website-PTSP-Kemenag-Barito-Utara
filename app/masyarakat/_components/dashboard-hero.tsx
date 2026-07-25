"use client";

import Link from "next/link";
import { PlusCircle, FileText, Sparkles, ShieldCheck } from "lucide-react";

interface DashboardHeroProps {
  fullName: string | null;
  totalRequests: number;
}

export function DashboardHero({ fullName, totalRequests }: DashboardHeroProps) {
  const displayName = fullName || "Pemohon";

  return (
    <section className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.25rem] bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/80 p-6 sm:p-8 md:p-10 text-white shadow-xl dark:shadow-none border border-emerald-800/50 dark:border-slate-800 transition-colors duration-300">
      {/* Subtle Background Radial Glow */}
      <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-emerald-500/15 dark:bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-teal-400/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 lg:gap-8">
        {/* Left Content */}
        <div className="max-w-xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 dark:bg-emerald-950/80 border border-white/20 dark:border-emerald-800/60 px-3.5 py-1 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 dark:text-emerald-300">
              Portal Pelayanan Keagamaan Mandiri
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            <span className="block">Selamat Datang,</span>
            <span className="text-emerald-300 block">
              {displayName} 👋
            </span>
          </h1>

          <p className="text-xs sm:text-sm font-medium text-emerald-100/80 dark:text-slate-300 leading-relaxed">
            Pantau status permohonan, buat pengajuan layanan baru, dan kelola
            dokumen administrasi Anda di satu tempat secara
            transparan.
          </p>

          {/* Quick Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/masyarakat/pengajuan/baru"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm px-5 py-3 shadow-lg shadow-emerald-950/30 transition-all hover:scale-[1.02] active:scale-95"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Buat Pengajuan Baru</span>
            </Link>

            <Link
              href="/masyarakat/pengajuan"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 dark:bg-slate-800/80 hover:bg-white/20 dark:hover:bg-slate-800 border border-white/20 dark:border-slate-700 text-white font-semibold text-xs sm:text-sm px-5 py-3 backdrop-blur-md transition-all active:scale-95"
            >
              <FileText className="h-4 w-4 text-emerald-300" />
              <span>Lihat Permohonan Saya</span>
            </Link>
          </div>
        </div>

        {/* Right Stats Badge */}
        <div className="shrink-0 flex items-center gap-4 bg-white/10 dark:bg-slate-800/60 border border-white/15 dark:border-slate-700/60 p-4 sm:p-5 rounded-2xl backdrop-blur-md md:self-center">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/20 dark:bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">
              {totalRequests}
            </div>
            <div className="text-[11px] font-semibold text-emerald-200/80 dark:text-slate-400">
              Total Permohonan Saya
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
