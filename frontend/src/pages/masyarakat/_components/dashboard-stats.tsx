import { ClipboardList, Clock, AlertCircle, CheckCircle2, ArrowUpRight } from "lucide-react";
import Link from "@/lib/next-compat/link";

interface DashboardStatsProps {
  stats: {
    total: number;
    pending: number;
    revision: number;
    finished: number;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statItems = [
    {
      label: "Total Permohonan",
      value: stats.total,
      icon: ClipboardList,
      color: "text-emerald-700 dark:text-emerald-400",
      accentBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      border: "border-slate-200/80 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700",
      badgeBg: "bg-emerald-100 dark:bg-emerald-900/60",
      href: "/masyarakat/pengajuan",
      note: "Semua berkas",
    },
    {
      label: "Sedang Diproses",
      value: stats.pending,
      icon: Clock,
      color: "text-amber-700 dark:text-amber-400",
      accentBg: "bg-amber-500/10 dark:bg-amber-500/20",
      border: "border-slate-200/80 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700",
      badgeBg: "bg-amber-100 dark:bg-amber-900/60",
      href: "/masyarakat/pengajuan",
      note: "Dalam telaah",
    },
    {
      label: "Perlu Perbaikan",
      value: stats.revision,
      icon: AlertCircle,
      color: "text-rose-700 dark:text-rose-400",
      accentBg: "bg-rose-500/10 dark:bg-rose-500/20",
      border: "border-slate-200/80 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-700",
      badgeBg: "bg-rose-100 dark:bg-rose-900/60",
      href: "/masyarakat/pengajuan",
      note: "Menunggu revisi",
    },
    {
      label: "Selesai Diproses",
      value: stats.finished,
      icon: CheckCircle2,
      color: "text-teal-700 dark:text-teal-400",
      accentBg: "bg-teal-500/10 dark:bg-teal-500/20",
      border: "border-slate-200/80 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-700",
      badgeBg: "bg-teal-100 dark:bg-teal-900/60",
      href: "/masyarakat/pengajuan",
      note: "Tuntas / terbit",
    },
  ];

  return (
    <div className="mt-5 sm:mt-7 lg:mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
      {statItems.map((stat, i) => (
        <Link
          key={i}
          href={stat.href}
          className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border ${stat.border} p-3.5 sm:p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between`}
        >
          {/* Top Row: Label and Icon */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {stat.label}
              </p>
              <h3 className={`mt-1 text-2xl sm:text-3xl font-black ${stat.color} tracking-tight`}>
                {stat.value}
              </h3>
            </div>

            <div className={`h-9 w-9 sm:h-10 sm:w-10 rounded-xl ${stat.accentBg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300`}>
              <stat.icon className={`h-4.5 w-4.5 sm:h-5 sm:w-5 ${stat.color}`} />
            </div>
          </div>

          {/* Bottom Row: Note and Micro-Arrow */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 truncate">
              {stat.note}
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors" />
          </div>
        </Link>
      ))}
    </div>
  );
}
