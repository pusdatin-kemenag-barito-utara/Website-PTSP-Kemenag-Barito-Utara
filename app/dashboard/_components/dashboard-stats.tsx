"use client";

import { ClipboardList, FileClock, ShieldCheck } from "lucide-react";

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
      label: "Total Pengajuan",
      value: stats.total,
      icon: ClipboardList,
      color: "text-[#059669]",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    },
    {
      label: "Sedang Proses",
      value: stats.pending,
      icon: FileClock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
    },
    {
      label: "Perlu Revisi",
      value: stats.revision,
      icon: AlertCircleIcon,
      color: "text-rose-600",
      bg: "bg-rose-50",
      border: "border-rose-100",
    },
    {
      label: "Selesai",
      value: stats.finished,
      icon: ShieldCheck,
      color: "text-emerald-700",
      bg: "bg-emerald-100/50",
      border: "border-emerald-200",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statItems.map((stat, i) => (
        <div
          key={i}
          className={`group relative overflow-hidden rounded-2xl sm:rounded-[2rem] border ${stat.border} ${stat.bg} p-5 sm:p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {stat.label}
              </p>
              <h3
                className={`mt-1 text-2xl sm:text-3xl font-black ${stat.color}`}
              >
                {stat.value}
              </h3>
            </div>
            <div
              className={`rounded-xl ${stat.bg.replace("/50", "")} p-2 ring-1 ring-white shadow-sm`}
            >
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
          </div>
          {/* Subtle background icon */}
          <stat.icon
            className={`absolute -bottom-4 -right-4 h-24 w-24 opacity-[0.03] transition-transform duration-500 group-hover:scale-110 ${stat.color}`}
          />
        </div>
      ))}
    </div>
  );
}

function AlertCircleIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
