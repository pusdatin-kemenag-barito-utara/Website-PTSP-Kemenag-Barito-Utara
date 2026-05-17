"use client";

import Link from "next/link";
import { User, FileText, ChevronRight } from "lucide-react";

export function DashboardActions() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Info Akun & Layanan
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl sm:rounded-[2rem] border border-slate-100 bg-white p-6 sm:p-8 shadow-sm transition-all hover:shadow-md">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
              <User className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Profil Saya</h3>
            <p className="mt-2 text-xs font-medium text-slate-500 leading-relaxed">
              Pastikan data diri Anda sudah benar agar proses administrasi
              lancar.
            </p>
            <Link
              href="/dashboard/profil"
              className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#059669] hover:gap-3 transition-all"
            >
              Update Profil <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="rounded-2xl sm:rounded-[2rem] border border-slate-100 bg-white p-6 sm:p-8 shadow-sm transition-all hover:shadow-md">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Bantuan</h3>
            <p className="mt-2 text-xs font-medium text-slate-500 leading-relaxed">
              Mengalami kendala saat membuat pengajuan? Baca panduan atau
              hubungi kami.
            </p>
            <Link
              href="/kontak"
              className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-600 hover:gap-3 transition-all"
            >
              Hubungi Admin <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-black text-slate-900 tracking-tight px-2">
          Aksi Cepat
        </h2>
        <div className="rounded-[2rem] bg-slate-900 p-6 sm:p-8 shadow-2xl relative overflow-hidden group">
          {/* Glow effect */}
          <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl transition-all duration-700 group-hover:bg-emerald-500/30" />

          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400/80 mb-2">
            Butuh Layanan?
          </p>
          <h3 className="text-xl font-black text-white leading-tight">
            Buat Pengajuan Baru <br /> Sekarang Juga
          </h3>
          <p className="mt-4 text-xs font-medium text-slate-400 leading-relaxed">
            Pilih dari 30+ jenis layanan keagamaan yang tersedia secara digital.
          </p>

          <Link
            href="/dashboard/pengajuan/baru"
            className="mt-8 flex h-14 items-center justify-center rounded-2xl bg-emerald-600 font-black text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-500 hover:shadow-emerald-500/40 active:scale-95"
          >
            Mulai Daftar
          </Link>
        </div>
      </div>
    </div>
  );
}
