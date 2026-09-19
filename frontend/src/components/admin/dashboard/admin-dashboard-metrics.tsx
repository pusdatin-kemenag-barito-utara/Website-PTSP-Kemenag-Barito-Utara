import { Layers3, Users, FileClock, TrendingUp } from "lucide-react";

function getHoverClass(color: string) {
  const map: Record<string, string> = {
    "from-emerald-500 to-teal-600": "group-hover:bg-gradient-to-br group-hover:from-emerald-500 group-hover:to-teal-600 group-hover:text-white",
    "from-blue-500 to-indigo-600": "group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-indigo-600 group-hover:text-white",
    "from-amber-500 to-orange-600": "group-hover:bg-gradient-to-br group-hover:from-amber-500 group-hover:to-orange-600 group-hover:text-white",
    "from-slate-600 to-slate-800": "group-hover:bg-gradient-to-br group-hover:from-slate-600 group-hover:to-slate-800 group-hover:text-white",
  };
  return map[color] || "group-hover:bg-gradient-to-br group-hover:from-emerald-500 group-hover:to-teal-600 group-hover:text-white";
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
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-100/80",
    },
    {
      title: "Pengguna",
      value: userCount ?? 0,
      sub: "Total akun terdaftar",
      icon: Users,
      color: "from-blue-500 to-indigo-600",
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-100/80",
    },
    {
      title: "Perlu Diproses",
      value: needAction,
      sub: "Menunggu tindakan admin",
      icon: FileClock,
      color: "from-amber-500 to-orange-600",
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-100/80",
      urgent: true,
    },
    {
      title: "Total Pengajuan",
      value: totalRequests,
      sub: "Seluruh siklus pengajuan",
      icon: TrendingUp,
      color: "from-slate-600 to-slate-800",
      bg: "bg-slate-50",
      text: "text-slate-700",
      border: "border-slate-200/70",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {metrics.map((item) => (
        <div
          key={item.title}
          className={`group relative overflow-hidden rounded-xl border ${item.border} bg-white p-3.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`}
        >
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-2.5">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.bg} ${item.text} transition-colors duration-200 ${getHoverClass(item.color)}`}>
                <item.icon className="h-4 w-4" />
              </div>
              {item.urgent && needAction > 0 && (
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
                </span>
              )}
            </div>

            <div className="space-y-0.5">
              <p className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 truncate">
                {item.title}
              </p>
              <h4 className="text-xl sm:text-2xl font-black tracking-tight text-slate-800 tabular-nums leading-tight">
                {item.value}
              </h4>
              <p className="text-[10px] font-medium text-slate-400 truncate">
                {item.sub}
              </p>
            </div>
          </div>

          {/* Subtle Bottom Accent Line */}
          <div className="absolute bottom-0 left-0 h-0.5 w-full bg-slate-50">
            <div className={`h-full w-0 bg-gradient-to-r ${item.color} transition-all duration-500 ease-out group-hover:w-full`} />
          </div>
        </div>
      ))}
    </div>
  );
}
