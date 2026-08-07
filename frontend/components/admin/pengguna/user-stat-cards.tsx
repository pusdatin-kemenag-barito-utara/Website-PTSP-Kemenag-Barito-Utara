import { Users, Crown, UserCheck, BadgeCheck } from "lucide-react";

export function UserStatCards({
  stats,
}: {
  stats: {
    total: number;
    superAdmin: number;
    admin: number;
    pegawai: number;
    user: number;
  };
}) {
  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      {[
        {
          label: "Total Pengguna",
          value: stats.total,
          icon: Users,
          color: "bg-slate-100 text-slate-600",
        },
        {
          label: "Super Admin",
          value: stats.superAdmin,
          icon: Crown,
          color: "bg-amber-100 text-amber-600",
        },

        {
          label: "Pegawai",
          value: stats.pegawai,
          icon: BadgeCheck,
          color: "bg-blue-100 text-blue-600",
        },
        {
          label: "Pemohon",
          value: stats.user,
          icon: Users,
          color: "bg-emerald-100 text-emerald-600",
        },
      ].map((card) => (
        <div
          key={card.label}
          className="group relative rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[11px] lg:text-xs font-medium text-slate-500 truncate">{card.label}</p>
              <p className="mt-1 text-2xl lg:text-3xl font-black text-slate-900 tabular-nums tracking-tight">
                {card.value}
              </p>
            </div>
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${card.color} transition-transform duration-300 group-hover:scale-110`}
            >
              <card.icon className="h-4 w-4 lg:h-5 lg:w-5" />
            </div>
          </div>
          <div className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-gradient-to-r from-[#059669] to-[#047857] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
      ))}
    </div>
  );
}

