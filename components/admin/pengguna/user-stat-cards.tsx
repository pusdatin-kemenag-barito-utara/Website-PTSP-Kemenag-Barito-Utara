import { Users, Crown, UserCheck } from "lucide-react";

export function UserStatCards({
  stats,
}: {
  stats: {
    total: number;
    super_admin: number;
    admin: number;
    user: number;
  };
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[
        {
          label: "Total Pengguna",
          value: stats.total,
          icon: Users,
          color: "bg-slate-100 text-slate-600",
        },
        {
          label: "Super Admin",
          value: stats.super_admin,
          icon: Crown,
          color: "bg-amber-100 text-amber-600",
        },
        {
          label: "Admin / Petugas",
          value: stats.admin,
          icon: UserCheck,
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
          className="group relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">{card.label}</p>
              <p className="mt-1 text-3xl font-black text-slate-900 tabular-nums tracking-tight">
                {card.value}
              </p>
            </div>
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.color} transition-transform duration-300 group-hover:scale-110`}
            >
              <card.icon className="h-5 w-5" />
            </div>
          </div>
          <div className="absolute bottom-0 left-5 right-5 h-0.5 rounded-full bg-gradient-to-r from-[#1f4bb7] to-[#2d5bcf] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
      ))}
    </div>
  );
}
