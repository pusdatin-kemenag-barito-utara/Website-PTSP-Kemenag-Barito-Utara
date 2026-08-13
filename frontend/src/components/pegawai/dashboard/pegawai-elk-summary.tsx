import { motion, type Variants } from "framer-motion";
import {
  ClipboardCheck,
  PlusCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  ArrowRight,
} from "lucide-react";
import Link from "@/lib/next-compat/link";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

interface ElkSummaryCardProps {
  sisaCuti: number | null;
  pengajuanPending: number;
  pengajuanDisetujuiBulanIni: number;
  totalPengajuan: number;
}

export function PegawaiElkSummaryCard({
  sisaCuti,
  pengajuanPending,
  pengajuanDisetujuiBulanIni,
  totalPengajuan,
}: ElkSummaryCardProps) {
  const currentMonthName = new Date().toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
  const currentDayName = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      {/* Top Main Section: Rekap LKH & Status Kehadiran/Kinerja */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Input LKH Cepat */}
        <motion.div
          variants={cardVariants}
          className="lg:col-span-2 rounded-2xl sm:rounded-3xl border border-teal-100 dark:border-slate-800 bg-gradient-to-br from-teal-900 via-emerald-900 to-slate-900 text-white p-5 sm:p-7 shadow-lg relative overflow-hidden flex flex-col justify-between"
        >
          <div className="relative z-10 space-y-3 sm:space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-2.5 py-1 text-[11px] font-bold text-teal-200 backdrop-blur-md">
                <CalendarDays className="h-3.5 w-3.5" />
                <span>Hari Ini: {currentDayName}</span>
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-teal-200/80">
                Periode {currentMonthName}
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg sm:text-2xl font-black tracking-tight text-white">
                Laporan Kinerja Harian (E-LK)
              </h3>
              <p className="text-[11px] sm:text-sm text-teal-100/80 font-medium leading-relaxed max-w-lg">
                Catat seluruh aktivitas, tugas, dan capaian kerja harian Anda
                untuk rekap kepegawaian bulanan secara akuntabel.
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
            <Link
              href="/pegawai/e-lk/isi"
              className="inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm px-4 py-2.5 sm:px-5 sm:py-3 shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-95"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Input LKH Hari Ini</span>
            </Link>
            <Link
              href="/pegawai/e-lk/harian"
              className="inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs sm:text-sm px-4 py-2.5 sm:px-5 sm:py-3 backdrop-blur-md transition-all active:scale-95"
            >
              <ClipboardCheck className="h-4 w-4 text-emerald-300" />
              <span>Rekap E-LK Bulanan</span>
            </Link>
          </div>

          {/* Decorative shapes */}
          <div className="absolute -right-16 -bottom-16 h-48 w-48 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />
        </motion.div>

        {/* Right Column: Status Cuti & Kuota */}
        <motion.div
          variants={cardVariants}
          className="rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Status Cuti ASN
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/50 px-2.5 py-0.5 rounded-full">
                {new Date().getFullYear()}
              </span>
            </div>

            <div>
              <div className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                {sisaCuti !== null ? `${sisaCuti} Hari` : "—"}
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                Sisa Hak Cuti Tahunan Tersedia
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Pengajuan Pending
              </span>
              <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400">
                {pengajuanPending} Berkas
              </span>
            </div>
            <Link
              href="/pegawai/cuti/tambah"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              <span>Ajukan Cuti</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Grid Status Ringkas 3 Kartu */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <motion.div
          variants={cardVariants}
          className="rounded-2xl border border-amber-100 dark:border-slate-800 bg-amber-50/40 dark:bg-slate-900 p-4 flex items-center gap-4"
        >
          <div className="h-11 w-11 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900 dark:text-slate-100 leading-tight">
              {pengajuanPending}
            </div>
            <div className="text-xs font-bold text-amber-700 dark:text-amber-400">
              Perlu Diproses
            </div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Pengajuan dalam antrean
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={cardVariants}
          className="rounded-2xl border border-blue-100 dark:border-slate-800 bg-blue-50/40 dark:bg-slate-900 p-4 flex items-center gap-4"
        >
          <div className="h-11 w-11 rounded-2xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900 dark:text-slate-100 leading-tight">
              {pengajuanDisetujuiBulanIni}
            </div>
            <div className="text-xs font-bold text-blue-700 dark:text-blue-400">
              Disetujui Bulan Ini
            </div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Permohonan disahkan
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={cardVariants}
          className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 p-4 flex items-center gap-4"
        >
          <div className="h-11 w-11 rounded-2xl bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900 dark:text-slate-100 leading-tight">
              {totalPengajuan}
            </div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Total Pengajuan
            </div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Riwayat pengajuan ASN
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
