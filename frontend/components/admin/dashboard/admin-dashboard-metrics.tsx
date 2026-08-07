import { Layers3, Users, FileClock, TrendingUp } from "lucide-react";

function getHoverClass(color: string) {
  const map: Record<string, string> = {
    "from-emerald-500 to-teal-600": "bg-gradient-to-br from-emerald-500 to-teal-600",
    "from-blue-500 to-indigo-600": "bg-gradient-to-br from-blue-500 to-indigo-600",
    "from-amber-500 to-orange-600": "bg-gradient-to-br from-amber-500 to-orange-600",
    "from-slate-600 to-slate-800": "bg-gradient-to-br from-slate-600 to-slate-800",
  };
  return map[color] || "bg-gradient-to-br from-emerald-500 to-teal-600";
}

export function AdminDashboardMetrics({
  serviceCount,
  userCount,
  needAction,
  totalRequests,
}: {
  serviceCount: number | null;
  userCount: number | null;
  needAction: number;
  totalRequests: number;
}) {
  const metrics = [
    {
      title: "Total Layanan",
      value: serviceCount ?? 0,
      sub: "Layanan aktif di sistem",
      icon: Layers3,
      color: "from-emerald-500 to-teal-600",
      bg: "bg-emerald-50/50",
      text: "text-emerald-700",
      border: "border-emerald-100",
    },
    {
      title: "Pengguna",
      value: userCount ?? 0,
      sub: "Total akun terdaftar",
      icon: Users,
      color: "from-blue-500 to-indigo-600",
      bg: "bg-blue-50/50",
      text: "text-blue-700",
      border: "border-blue-100",
    },
    {
      title: "Perlu Diproses",
      value: needAction,
      sub: "Menunggu tindakan admin",
      icon: FileClock,
      color: "from-amber-500 to-orange-600",
      bg: "bg-amber-50/50",
      text: "text-amber-700",
      border: "border-amber-100",
      urgent: true,
    },
    {
      title: "Total Pengajuan",
      value: totalRequests,
      sub: "Seluruh siklus pengajuan",
      icon: TrendingUp,
      color: "from-slate-600 to-slate-800",
      bg: "bg-slate-50/50",
      text: "text-slate-700",
      border: "border-slate-100",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {metrics.map((item) => (
        <div
          key={item.title}
          className={`group relative overflow-hidden rounded-3xl border ${item.border} bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/5`}
        >
          {/* Background Decorative Gradient */}
          <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${item.color} opacity-[0.03] transition-transform duration-500 group-hover:scale-150`} />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.bg} ${item.text} transition-colors duration-300 group-hover:text-white ${getHoverClass(item.color)}`}>
                <item.icon className="h-6 w-6" />
              </div>
              {item.urgent && needAction > 0 && (
                <span className="flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
                </span>
              )}
            </div>
            
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500/80">
                {item.title}
              </p>
              <div className="flex items-baseline gap-1">
                <h4 className="text-3xl font-black tracking-tight text-slate-800 tabular-nums">
                  {item.value}
                </h4>
              </div>
              <p className="text-[11px] font-medium text-slate-400">
                {item.sub}
              </p>
            </div>
          </div>

          {/* Bottom Progress Line */}
          <div className="absolute bottom-0 left-0 h-1 w-full bg-slate-50">
            <div className={`h-full w-0 bg-gradient-to-r ${item.color} transition-all duration-700 ease-out group-hover:w-full`} />
          </div>
        </div>
      ))}
    </div>
  );
}
