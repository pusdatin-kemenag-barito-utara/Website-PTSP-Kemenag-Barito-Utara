import { ShieldCheck, BadgeCheck, Users, AlertCircle, Sparkles } from "lucide-react";

interface UserStatCardsProps {
  stats: {
    total: number;
    petugas: number;
    pendingPetugas: number;
    pegawai: number;
    pemohon: number;
    pemohonGoogle?: number;
    pemohonWhatsApp?: number;
  };
}

export function UserStatCards({ stats }: UserStatCardsProps) {
  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      {[
        {
          label: "Petugas Admin",
          value: stats.petugas,
          sublabel: stats.pendingPetugas > 0 ? `${stats.pendingPetugas} menunggu verifikasi` : "Akun admin aktif",
          subColor: stats.pendingPetugas > 0 ? "text-amber-600 font-bold" : "text-slate-400",
          icon: ShieldCheck,
          color: "bg-amber-100 text-amber-700",
          ring: stats.pendingPetugas > 0 ? "ring-1 ring-amber-300" : "",
        },
        {
          label: "Data Pegawai",
          value: stats.pegawai,
          sublabel: "Tersinkron ke Cuti",
          subColor: "text-emerald-600 font-bold",
          icon: BadgeCheck,
          color: "bg-blue-100 text-blue-700",
          ring: "",
        },
        {
          label: "Pemohon Masyarakat",
          value: stats.pemohon,
          sublabel:
            stats.pemohonGoogle !== undefined && stats.pemohonWhatsApp !== undefined
              ? `${stats.pemohonGoogle} Google · ${stats.pemohonWhatsApp} WA`
              : "Google & WhatsApp",
          subColor: "text-slate-500",
          icon: Users,
          color: "bg-emerald-100 text-emerald-700",
          ring: "",
        },
        {
          label: "Total Seluruh Pengguna",
          value: stats.total,
          sublabel: "Database terintegrasi",
          subColor: "text-slate-400",
          icon: Sparkles,
          color: "bg-slate-100 text-slate-700",
          ring: "",
        },
      ].map((card) => (
        <div
          key={card.label}
          className={`group relative rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs transition-all duration-300 hover:shadow-xs hover:-translate-y-0.5 flex flex-col justify-between ${card.ring}`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
                {card.label}
              </p>
              <p className="mt-0.5 text-xl font-black text-slate-900 tabular-nums tracking-tight">
                {card.value}
              </p>
              <p className={`text-[10.5px] truncate mt-0.5 ${card.subColor}`}>
                {card.sublabel}
              </p>
            </div>
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${card.color} transition-transform duration-300 group-hover:scale-110`}
            >
              <card.icon className="h-4 w-4" />
            </div>
          </div>
          <div className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-gradient-to-r from-[#059669] to-[#047857] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
      ))}
    </div>
  );
}
