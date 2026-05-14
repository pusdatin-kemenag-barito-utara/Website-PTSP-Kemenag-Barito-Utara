import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  FileClock,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  LayoutGrid,
  FileText,
  User,
} from "lucide-react";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function DashboardHomePage() {
  const profile = await requireAuth();

  const requests = await prisma.service_requests.findMany({
    where: { user_id: profile.id },
    select: { status: true },
  });

  const stats = {
    total: requests.length,
    pending: requests.filter((item) =>
      ["submitted", "under_review"].includes(item.status),
    ).length,
    revision: requests.filter((item) => item.status === "revision_required")
      .length,
    finished: requests.filter((item) =>
      ["approved", "completed"].includes(item.status),
    ).length,
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700">
      {/* Welcome Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#064e3b] via-[#059669] to-[#047857] p-8 md:p-12 shadow-[0_20px_50px_-20px_rgba(4,120,87,0.4)]">
        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-emerald-400/10 blur-2xl" />
        
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Portal Mandiri Pemohon</span>
            </div>
            <h1 className="mt-6 text-4xl font-black text-white md:text-5xl tracking-tighter leading-none">
              Halo, {profile.full_name?.split(' ')[0] || "Pemohon"}! 👋
            </h1>
            <p className="mt-4 text-base font-medium text-emerald-50/70 leading-relaxed max-w-lg">
              Selamat datang kembali. Semua pengajuan dan dokumen Anda tersimpan dengan aman di sini.
            </p>
            
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/dashboard/pengajuan/baru"
                className="group inline-flex items-center gap-3 rounded-2xl bg-white px-8 py-4 text-sm font-black text-[#064e3b] shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl active:scale-95"
              >
                Buat Pengajuan Baru
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/dashboard/pengajuan"
                className="inline-flex items-center gap-3 rounded-2xl border border-white/20 bg-white/5 px-8 py-4 text-sm font-black text-white backdrop-blur-md transition-all hover:bg-white/10 active:scale-95"
              >
                Riwayat Saya
              </Link>
            </div>
          </div>

          <div className="hidden lg:block">
             <div className="relative h-48 w-48 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-center">
                <LayoutGrid className="h-20 w-20 text-white/20" />
                <div className="absolute -bottom-2 -right-2 h-14 w-14 rounded-2xl bg-emerald-400 shadow-xl flex items-center justify-center text-white font-black text-2xl">
                   {stats.total}
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Statistics Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Pengajuan", value: stats.total, icon: ClipboardList, color: "text-[#059669]", bg: "bg-emerald-50", border: "border-emerald-100" },
          { label: "Sedang Proses", value: stats.pending, icon: FileClock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
          { label: "Perlu Revisi", value: stats.revision, icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" },
          { label: "Selesai", value: stats.finished, icon: ShieldCheck, color: "text-emerald-700", bg: "bg-emerald-100/50", border: "border-emerald-200" },
        ].map((stat, i) => (
          <div key={i} className={`group relative overflow-hidden rounded-[2rem] border ${stat.border} ${stat.bg} p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                <h3 className={`mt-1 text-3xl font-black ${stat.color}`}>{stat.value}</h3>
              </div>
              <div className={`rounded-xl ${stat.bg.replace('/50', '')} p-2 ring-1 ring-white shadow-sm`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
            {/* Subtle background icon */}
            <stat.icon className={`absolute -bottom-4 -right-4 h-24 w-24 opacity-[0.03] transition-transform duration-500 group-hover:scale-110 ${stat.color}`} />
          </div>
        ))}
      </div>

      {/* Main Actions Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Info Akun & Layanan</h2>
           </div>
           <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm transition-all hover:shadow-md">
                 <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                    <User className="h-6 w-6" />
                 </div>
                 <h3 className="text-lg font-bold text-slate-900">Profil Saya</h3>
                 <p className="mt-2 text-xs font-medium text-slate-500 leading-relaxed">
                    Pastikan data diri Anda sudah benar agar proses administrasi lancar.
                 </p>
                 <Link href="/dashboard/profil" className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#059669] hover:gap-3 transition-all">
                    Update Profil <ChevronRight className="h-3 w-3" />
                 </Link>
              </div>
              <div className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm transition-all hover:shadow-md">
                 <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <FileText className="h-6 w-6" />
                 </div>
                 <h3 className="text-lg font-bold text-slate-900">Bantuan</h3>
                 <p className="mt-2 text-xs font-medium text-slate-500 leading-relaxed">
                    Mengalami kendala saat membuat pengajuan? Baca panduan atau hubungi kami.
                 </p>
                 <Link href="/kontak" className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-600 hover:gap-3 transition-all">
                    Hubungi Admin <ChevronRight className="h-3 w-3" />
                 </Link>
              </div>
           </div>
        </div>

        <div className="space-y-6">
           <h2 className="text-xl font-black text-slate-900 tracking-tight px-2">Aksi Cepat</h2>
           <div className="rounded-[2.5rem] bg-slate-900 p-8 shadow-2xl relative overflow-hidden group">
              {/* Glow effect */}
              <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl transition-all duration-700 group-hover:bg-emerald-500/30" />
              
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400/80 mb-2">Butuh Layanan?</p>
              <h3 className="text-xl font-black text-white leading-tight">Buat Pengajuan Baru <br/> Sekarang Juga</h3>
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
    </div>
  );
}

function AlertCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
