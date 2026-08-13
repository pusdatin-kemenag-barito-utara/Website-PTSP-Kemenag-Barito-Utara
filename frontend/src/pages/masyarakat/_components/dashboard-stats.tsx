import { ClipboardList, Clock, AlertCircle, CheckCircle2 } from "lucide-react";

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
      bg: "bg-emerald-50/80 dark:bg-emerald-950/40",
      border: "border-emerald-100 dark:border-emerald-900/40",
      badgeBg: "bg-emerald-100 dark:bg-emerald-900/60",
    },
    {
      label: "Sedang Diproses",
      value: stats.pending,
      icon: Clock,
      color: "text-amber-700 dark:text-amber-400",
      bg: "bg-amber-50/80 dark:bg-amber-950/40",
      border: "border-amber-100 dark:border-amber-900/40",
      badgeBg: "bg-amber-100 dark:bg-amber-900/60",
    },
    {
      label: "Perlu Perbaikan",
      value: stats.revision,
      icon: AlertCircle,
      color: "text-rose-700 dark:text-rose-400",
      bg: "bg-rose-50/80 dark:bg-rose-950/40",
      border: "border-rose-100 dark:border-rose-900/40",
      badgeBg: "bg-rose-100 dark:bg-rose-900/60",
    },
    {
      label: "Selesai Diproses",
      value: stats.finished,
      icon: CheckCircle2,
      color: "text-teal-700 dark:text-teal-400",
      bg: "bg-teal-50/80 dark:bg-teal-950/40",
      border: "border-teal-100 dark:border-teal-900/40",
      badgeBg: "bg-teal-100 dark:bg-teal-900/60",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
      {statItems.map((stat, i) => (
        <div
          key={i}
          className={`relative overflow-hidden rounded-2xl border ${stat.border} ${stat.bg} p-4 sm:p-5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5`}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {stat.label}
              </p>
              <h3 className={`mt-1.5 text-2xl sm:text-3xl font-black ${stat.color}`}>
                {stat.value}
              </h3>
            </div>

            <div className={`h-10 w-10 sm:h-11 sm:w-11 rounded-xl ${stat.badgeBg} flex items-center justify-center shrink-0`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
