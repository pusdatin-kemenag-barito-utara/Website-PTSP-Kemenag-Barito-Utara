import { Metadata } from "next";
import { getCurrentProfile } from "@/lib/auth";
import { Briefcase, ClipboardList } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard Pegawai | PTSP Kemenag Barito Utara",
  description: "Dashboard panel untuk pegawai PTSP Kemenag Barito Utara",
};

export default async function PegawaiDashboardPage() {
  const profile = await getCurrentProfile();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-8 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-md">
              Portal Mandiri Pegawai
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Halo, {profile?.fullName || "Pegawai"}! 👋
            </h1>
            <p className="max-w-xl text-emerald-100">
              Selamat datang di portal kepegawaian. Kelola layanan ASN dan laporan E-LK Harian Anda dengan mudah di sini.
            </p>
          </div>
        </div>
        {/* Abstract Background Decoration */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 left-10 h-64 w-64 rounded-full bg-teal-500/20 blur-3xl" />
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Briefcase className="h-6 w-6" />
          </div>
          <h3 className="mb-2 text-lg font-bold text-slate-800">Layanan ASN</h3>
          <p className="mb-4 text-sm text-slate-500">
            Ajukan berbagai layanan kepegawaian secara online dan pantau status pengajuan Anda.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/pegawai/layanan/ajukan" className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
              Ajukan Baru
            </Link>
            <Link href="/pegawai/layanan/riwayat" className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Riwayat
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
            <ClipboardList className="h-6 w-6" />
          </div>
          <h3 className="mb-2 text-lg font-bold text-slate-800">E-LK Harian</h3>
          <p className="mb-4 text-sm text-slate-500">
            Isi laporan kinerja harian, pantau rekap bulanan, dan unggah dokumen final.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/pegawai/e-lk/isi" className="inline-flex items-center rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">
              Isi LKH Baru
            </Link>
            <Link href="/pegawai/e-lk/harian" className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Lihat E-LK
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
