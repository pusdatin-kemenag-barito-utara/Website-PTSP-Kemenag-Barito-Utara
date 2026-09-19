import Link from "@/lib/next-compat/link";
import { PlusCircle, FileText, Sparkles, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";

interface DashboardHeroProps {
  fullName: string | null;
  totalRequests: number;
}

export function DashboardHero({ fullName, totalRequests }: DashboardHeroProps) {
  const displayName = fullName || "Pemohon";

  return (
    <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/80 p-5 sm:p-7 lg:p-8 text-white shadow-xl dark:shadow-none border border-emerald-800/40 dark:border-slate-800 transition-all">
      {/* Background Radial Glow */}
      <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-emerald-500/15 dark:bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 h-48 w-48 rounded-full bg-teal-400/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 lg:gap-8">
        {/* Left Side: Greeting & CTAs */}
        <div className="max-w-xl space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 dark:bg-emerald-950/80 border border-white/20 dark:border-emerald-800/60 px-3 py-1 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 dark:text-emerald-300">
              Portal PTSP Kemenag Barito Utara
            </span>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white leading-snug">
              Selamat Datang,{" "}
              <span className="text-emerald-300 inline-block font-extrabold">
                {displayName} 👋
              </span>
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm font-medium text-emerald-100/80 dark:text-slate-300 leading-relaxed max-w-lg">
              Pantau progres permohonan layanan, ajukan berkas baru secara mandiri, dan unduh dokumen resmi Kemenag secara transparan.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-1 grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3">
            <Link
              href="/masyarakat/pengajuan/baru"
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm px-3 sm:px-5 py-2.5 sm:py-3 shadow-md shadow-emerald-950/30 transition-all hover:scale-[1.02] active:scale-95 text-center"
            >
              <PlusCircle className="h-4 w-4 shrink-0" />
              <span className="truncate">Pengajuan Baru</span>
            </Link>

            <Link
              href="/masyarakat/pengajuan"
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-white/10 dark:bg-slate-800/80 hover:bg-white/20 dark:hover:bg-slate-800 border border-white/20 dark:border-slate-700 text-white font-semibold text-xs sm:text-sm px-3 sm:px-5 py-2.5 sm:py-3 backdrop-blur-md transition-all active:scale-95 text-center"
            >
              <FileText className="h-4 w-4 text-emerald-300 shrink-0" />
              <span className="truncate">Riwayat Saya</span>
            </Link>
          </div>
        </div>

        {/* Right Side: Account Status & Quick Info */}
        <div className="shrink-0 lg:w-[260px] flex flex-col justify-between rounded-2xl bg-white/10 dark:bg-slate-800/60 border border-white/15 dark:border-slate-700/60 p-3.5 sm:p-5 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3 pb-2.5 sm:pb-3 border-b border-white/10 dark:border-slate-700/50">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-emerald-200 dark:text-emerald-300 uppercase tracking-wider">
                Sistem Aktif
              </span>
            </div>
            <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-white/80 bg-white/10 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="h-3 w-3 text-emerald-300" />
              <span>Terverifikasi</span>
            </div>
          </div>

          <div className="pt-2.5 sm:pt-3 flex items-center justify-between">
            <div>
              <div className="text-xl sm:text-3xl font-black text-white">
                {totalRequests}
              </div>
              <div className="text-[10px] sm:text-[11px] font-medium text-emerald-200/80 dark:text-slate-400">
                Total Permohonan Saya
              </div>
            </div>

            <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl bg-emerald-500/20 dark:bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
              <ShieldCheck className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
