"use client";

import { motion, Variants } from "framer-motion";
import { Clock, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import type { RecentCutiItem } from "@/app/pegawai/_lib/dashboard-data";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -16 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 100, damping: 18 },
  },
};

function getStatusBadge(cuti: RecentCutiItem) {
  if (cuti.status === "approved") {
    return { icon: CheckCircle2, label: "Disetujui", cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20" };
  }
  if (cuti.status === "rejected") {
    return { icon: XCircle, label: "Tidak Disetujui", cls: "bg-rose-50 text-rose-700 ring-1 ring-rose-600/20" };
  }
  if (cuti.statusAtasan !== "pending") {
    return { icon: Clock, label: "Menunggu Kepala Kantor", cls: "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20" };
  }
  return { icon: Clock, label: "Menunggu Atasan", cls: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20" };
}

export function PegawaiRecentActivity({
  items,
}: {
  items: RecentCutiItem[];
}) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-3 sm:p-6 shadow-sm">
      <div className="mb-3 sm:mb-4 flex items-center justify-between">
        <h3 className="text-sm sm:text-lg font-bold text-slate-800">Aktivitas Terbaru</h3>
        <Link
          href="/pegawai/cuti"
          className="inline-flex items-center gap-1 text-[11px] sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          Lihat Semua
          <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
        </Link>
      </div>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-1.5 sm:space-y-3"
      >
        {items.map((cuti) => {
          const badge = getStatusBadge(cuti);
          const BadgeIcon = badge.icon;
          return (
            <motion.div key={cuti.id} variants={itemVariants}>
              <Link
                href="/pegawai/cuti"
                className="flex items-center gap-2 sm:gap-4 rounded-lg sm:rounded-xl border border-slate-100 p-2 sm:p-4 transition-all hover:border-emerald-200 hover:shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                    <span className="font-bold text-slate-800 text-[11px] sm:text-sm truncate">
                      {cuti.jenisCuti}
                    </span>
                    <span className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 py-0.5 sm:px-2 sm:py-0.5 text-[8px] sm:text-[10px] font-bold rounded-full shrink-0 ${badge.cls}`}>
                      <BadgeIcon className="h-2 w-2 sm:h-3 sm:w-3" />
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-slate-500">
                    {format(new Date(cuti.tanggalMulai), "dd MMM", { locale: id })}
                    {" — "}
                    {format(new Date(cuti.tanggalSelesai), "dd MMM yyyy", { locale: id })}
                  </p>
                </div>
                <p className="text-[9px] sm:text-[10px] text-slate-400 shrink-0">
                  {format(new Date(cuti.createdAt), "dd MMM", { locale: id })}
                </p>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
