"use client";

import Link from "next/link";
import { ClipboardList, Plus } from "lucide-react";

export function RequestsHeader() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-[#064e3b] via-[#059669] to-[#047857] p-6 sm:p-8 md:p-12 shadow-[0_20px_50px_-20px_rgba(4,120,87,0.4)]">
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 backdrop-blur-md">
            <ClipboardList className="h-3.5 w-3.5 text-emerald-300" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
              Manajemen Dokumen
            </span>
          </div>
          <h1 className="mt-6 text-3xl sm:text-4xl font-black text-white md:text-5xl tracking-tighter">
            Riwayat Pengajuan
          </h1>
          <p className="mt-4 text-sm font-medium text-emerald-50/70 max-w-lg leading-relaxed">
            Pantau seluruh progres layanan Anda secara transparan. Klik "Lihat
            Detail" untuk informasi lengkap.
          </p>
        </div>
        <div className="shrink-0">
          <Link
            href="/dashboard/pengajuan/baru"
            className="group inline-flex items-center justify-center gap-3 h-12 sm:h-14 px-6 sm:px-8 rounded-2xl bg-white text-[#064e3b] font-black text-xs sm:text-sm shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl active:scale-95"
          >
            <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
            Buat Pengajuan Baru
          </Link>
        </div>
      </div>
    </section>
  );
}
