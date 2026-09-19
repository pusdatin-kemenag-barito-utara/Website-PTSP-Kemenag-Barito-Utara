import React from "react";
import { 
  ClipboardList, 
  CalendarDays, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Users 
} from "lucide-react";
import type { LaporanKinerjaItem } from "./types";

interface LaporanKpiCardsProps {
  items: LaporanKinerjaItem[];
}

export const LaporanKpiCards: React.FC<LaporanKpiCardsProps> = ({ items }) => {
  const todayStr = new Date().toISOString().split("T")[0];

  const totalLaporan = items.length;
  const laporanHariIni = items.filter(
    (item) => item.tanggal === todayStr || item.tanggal?.startsWith(todayStr)
  ).length;
  const pendingCount = items.filter((item) => item.status === "pending").length;
  const approvedCount = items.filter((item) => item.status === "approved").length;
  const revisionCount = items.filter((item) => item.status === "revision").length;
  
  const distinctPegawai = new Set(
    items.map((item) => item.userId || item.pegawaiNip).filter(Boolean)
  ).size;

  const cards = [
    {
      title: "Total Laporan",
      value: totalLaporan,
      description: "Aktivitas terdata",
      icon: ClipboardList,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/40",
      borderColor: "border-blue-200/70 dark:border-blue-900/40",
      badgeColor: "bg-blue-100/80 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
    },
    {
      title: "Laporan Hari Ini",
      value: laporanHariIni,
      description: "Tercatat hari ini",
      icon: CalendarDays,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
      borderColor: "border-emerald-200/70 dark:border-emerald-900/40",
      badgeColor: "bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
      hasPulse: true,
    },
    {
      title: "Menunggu Review",
      value: pendingCount,
      description: "Perlu diverifikasi",
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950/40",
      borderColor: "border-amber-200/70 dark:border-amber-900/40",
      badgeColor: "bg-amber-100/80 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
    },
    {
      title: "Disetujui",
      value: approvedCount,
      description: "Terverifikasi pimpinan",
      icon: CheckCircle2,
      color: "text-teal-600 dark:text-teal-400",
      bgColor: "bg-teal-50 dark:bg-teal-950/40",
      borderColor: "border-teal-200/70 dark:border-teal-900/40",
      badgeColor: "bg-teal-100/80 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300",
    },
    {
      title: "Perlu Revisi",
      value: revisionCount,
      description: "Ada catatan evaluasi",
      icon: AlertCircle,
      color: "text-rose-600 dark:text-rose-400",
      bgColor: "bg-rose-50 dark:bg-rose-950/40",
      borderColor: "border-rose-200/70 dark:border-rose-900/40",
      badgeColor: "bg-rose-100/80 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
    },
    {
      title: "Pegawai Aktif",
      value: distinctPegawai,
      description: "ASN pengisi LKH",
      icon: Users,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/40",
      borderColor: "border-purple-200/70 dark:border-purple-900/40",
      badgeColor: "bg-purple-100/80 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={idx}
            className={`relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-4 border ${card.borderColor} shadow-xs hover:shadow-md transition-all duration-200 group`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate">
                {card.title}
              </span>
              <div
                className={`h-7 w-7 rounded-xl ${card.bgColor} ${card.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}
              >
                <IconComponent className="h-4 w-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {card.value.toLocaleString("id-ID")}
              </span>
              {card.hasPulse && card.value > 0 && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              )}
            </div>

            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1 truncate">
              {card.description}
            </p>
          </div>
        );
      })}
    </div>
  );
};
