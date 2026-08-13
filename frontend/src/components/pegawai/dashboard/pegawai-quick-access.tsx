import { motion, type Variants } from "framer-motion";
import { Briefcase, ClipboardList, CalendarRange } from "lucide-react";
import Link from "@/lib/next-compat/link";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

const cards = [
  {
    title: "Layanan ASN",
    desc: "Ajukan berbagai layanan kepegawaian secara online dan pantau status pengajuan Anda.",
    icon: Briefcase,
    color: "emerald",
    primaryHref: "/pegawai/layanan/ajukan",
    primaryLabel: "Ajukan Baru",
    secondaryHref: "/pegawai/layanan/riwayat",
    secondaryLabel: "Riwayat",
  },
  {
    title: "E-LK Harian",
    desc: "Isi laporan kinerja harian, pantau rekap bulanan, dan unggah dokumen final.",
    icon: ClipboardList,
    color: "teal",
    primaryHref: "/pegawai/e-lk/isi",
    primaryLabel: "Isi LKH Baru",
    secondaryHref: "/pegawai/e-lk/harian",
    secondaryLabel: "Lihat E-LK",
  },
  {
    title: "Pengajuan Cuti",
    desc: "Ajukan cuti tahunan, besar, sakit, atau alasan penting secara online.",
    icon: CalendarRange,
    color: "violet",
    primaryHref: "/pegawai/cuti/tambah",
    primaryLabel: "Ajukan Baru",
    secondaryHref: "/pegawai/cuti",
    secondaryLabel: "Riwayat",
  },
] as const;

const colorMap: Record<string, { bg: string; text: string; btn: string; border: string }> = {
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    btn: "bg-emerald-600 hover:bg-emerald-700",
    border: "border-emerald-100",
  },
  teal: {
    bg: "bg-teal-50",
    text: "text-teal-600",
    btn: "bg-teal-600 hover:bg-teal-700",
    border: "border-teal-100",
  },
  violet: {
    bg: "bg-violet-50",
    text: "text-violet-600",
    btn: "bg-violet-600 hover:bg-violet-700",
    border: "border-violet-100",
  },
};

export function PegawaiQuickAccessCards() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4"
    >
      {cards.map((card) => {
        const colors = colorMap[card.color];
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            variants={cardVariants}
            className={`rounded-3xl border ${colors.border} bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/40 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between`}
          >
            <div>
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${colors.bg} ${colors.text} shadow-xs`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100">
                {card.title}
              </h3>
              <p className="mb-6 text-xs sm:text-sm leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
                {card.desc}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Link
                href={card.primaryHref}
                className={`inline-flex items-center justify-center rounded-xl ${colors.btn} px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition-all hover:scale-[1.02] active:scale-95`}
              >
                {card.primaryLabel}
              </Link>
              <Link
                href={card.secondaryHref}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95"
              >
                {card.secondaryLabel}
              </Link>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
