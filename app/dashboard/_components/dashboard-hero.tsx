"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, LayoutGrid, PlusCircle } from "lucide-react";

interface DashboardHeroProps {
  fullName: string | null;
  totalRequests: number;
}

export function DashboardHero({ fullName, totalRequests }: DashboardHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-[#064e3b] via-[#059669] to-[#047857] p-6 sm:p-8 md:p-12 shadow-[0_20px_50px_-20px_rgba(4,120,87,0.4)]">
      {/* Decorative elements */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl animate-pulse" />
      <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-emerald-400/10 blur-2xl" />

      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-10">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
              Portal Mandiri Pemohon
            </span>
          </div>
          <h1 className="mt-6 text-3xl sm:text-4xl font-black text-white md:text-5xl tracking-tighter leading-none">
            Halo, {fullName?.split(" ")[0] || "Pemohon"}! 👋
          </h1>
          <p className="mt-4 text-base font-medium text-emerald-50/70 leading-relaxed max-w-lg">
            Selamat datang kembali. Semua pengajuan dan dokumen Anda tersimpan
            dengan aman di sini.
          </p>

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              href="/masyarakat/pengajuan/baru"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-3 text-xs font-bold transition-all shadow-lg shadow-emerald-950/40 hover:scale-[1.02] active:scale-95"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Buat Pengajuan Baru</span>
            </Link>
            <Link
              href="/masyarakat/pengajuan"
              className="inline-flex items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/5 px-6 sm:px-8 py-3.5 sm:py-4 text-sm font-black text-white backdrop-blur-md transition-all hover:bg-white/10 active:scale-95"
            >
              Riwayat Saya
            </Link>
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="relative h-48 w-48 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-center">
            <LayoutGrid className="h-20 w-20 text-white/20" />
            <div className="absolute -bottom-2 -right-2 h-14 w-14 rounded-2xl bg-emerald-400 shadow-xl flex items-center justify-center text-white font-black text-2xl">
              {totalRequests}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
