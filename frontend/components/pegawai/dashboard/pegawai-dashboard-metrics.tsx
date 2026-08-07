"use client";

import { motion, Variants } from "framer-motion";
import { CalendarCheck, Clock, CheckCircle2, FileText } from "lucide-react";

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

export function PegawaiDashboardMetrics({
  sisaCuti,
  totalPengajuanCuti,
  pengajuanPending,
  pengajuanDisetujuiBulanIni,
}: {
  sisaCuti: number | null;
  totalPengajuanCuti: number;
  pengajuanPending: number;
  pengajuanDisetujuiBulanIni: number;
}) {
  const metrics = [
    {
      title: "Sisa Cuti Tahunan",
      value: sisaCuti !== null ? `${sisaCuti} hari` : "—",
      sub: "Tahun " + new Date().getFullYear(),
      icon: CalendarCheck,
      color: "from-emerald-500 to-teal-600",
      bg: "bg-emerald-50/50",
      text: "text-emerald-700",
      border: "border-emerald-100",
    },
    {
      title: "Perlu Diproses",
      value: pengajuanPending,
      sub: "Pengajuan cuti pending",
      icon: Clock,
      color: "from-amber-500 to-orange-600",
      bg: "bg-amber-50/50",
      text: "text-amber-700",
      border: "border-amber-100",
      urgent: pengajuanPending > 0,
    },
    {
      title: "Disetujui Bulan Ini",
      value: pengajuanDisetujuiBulanIni,
      sub: "Cuti telah disetujui",
      icon: CheckCircle2,
      color: "from-blue-500 to-indigo-600",
      bg: "bg-blue-50/50",
      text: "text-blue-700",
      border: "border-blue-100",
    },
    {
      title: "Total Pengajuan Cuti",
      value: totalPengajuanCuti,
      sub: "Seluruh pengajuan",
      icon: FileText,
      color: "from-slate-600 to-slate-800",
      bg: "bg-slate-50/50",
      text: "text-slate-700",
      border: "border-slate-100",
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
    >
      {metrics.map((item) => (
        <motion.div
          key={item.title}
          variants={cardVariants}
          className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl border ${item.border} bg-white p-3 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/5`}
        >
          <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${item.color} opacity-[0.03] transition-transform duration-500 group-hover:scale-150`} />

          <div className="relative z-10">
            <div className="mb-2 sm:mb-4 flex items-center justify-between">
              <div className={`flex h-8 w-8 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl ${item.bg} ${item.text} transition-colors duration-300 group-hover:text-white ${getHoverClass(item.color)}`}>
                <item.icon className="h-4 w-4 sm:h-6 sm:w-6" />
              </div>
              {item.urgent && (
                <span className="flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                </span>
              )}
            </div>

            <div className="space-y-0.5 sm:space-y-1">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500/80">
                {item.title}
              </p>
              <div className="flex items-baseline gap-1">
                <h4 className="text-xl sm:text-3xl font-black tracking-tight text-slate-800 tabular-nums">
                  {item.value}
                </h4>
              </div>
              <p className="text-[9px] sm:text-[11px] font-medium text-slate-400">
                {item.sub}
              </p>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 h-0.5 sm:h-1 w-full bg-slate-50">
            <div className={`h-full w-0 bg-gradient-to-r ${item.color} transition-all duration-700 ease-out group-hover:w-full`} />
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

function getHoverClass(color: string) {
  const map: Record<string, string> = {
    "from-emerald-500 to-teal-600": "bg-gradient-to-br from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600": "bg-gradient-to-br from-amber-500 to-orange-600",
    "from-blue-500 to-indigo-600": "bg-gradient-to-br from-blue-500 to-indigo-600",
    "from-slate-600 to-slate-800": "bg-gradient-to-br from-slate-600 to-slate-800",
  };
  return map[color] || "bg-gradient-to-br from-emerald-500 to-teal-600";
}
