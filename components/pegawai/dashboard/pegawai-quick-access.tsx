"use client";

import { motion, Variants } from "framer-motion";
import { Briefcase, ClipboardList, CalendarRange } from "lucide-react";
import Link from "next/link";

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
            className={`rounded-2xl border ${colors.border} bg-white shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="p-3 sm:p-6">
              <div className={`mb-3 sm:mb-4 flex h-8 w-8 sm:h-12 sm:w-12 items-center justify-center rounded-xl ${colors.bg} ${colors.text}`}>
                <Icon className="h-4 w-4 sm:h-6 sm:w-6" />
              </div>
              <h3 className="mb-1 sm:mb-2 text-sm sm:text-lg font-bold text-slate-800">
                {card.title}
              </h3>
              <p className="mb-3 sm:mb-4 text-[11px] sm:text-sm leading-relaxed text-slate-500 line-clamp-2 sm:line-clamp-none">
                {card.desc}
              </p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <Link
                  href={card.primaryHref}
                  className={`inline-flex items-center rounded-lg ${colors.btn} px-2.5 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-sm font-medium text-white transition-all active:scale-95`}
                >
                  {card.primaryLabel}
                </Link>
                <Link
                  href={card.secondaryHref}
                  className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all active:scale-95"
                >
                  {card.secondaryLabel}
                </Link>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
