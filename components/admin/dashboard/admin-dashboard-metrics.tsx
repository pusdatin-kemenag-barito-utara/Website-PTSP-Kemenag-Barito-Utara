import { Layers3, Users, FileClock, TrendingUp } from "lucide-react";

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
  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {/* Metric 1 */}
      <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#059669]">
            <Layers3 className="h-5 w-5" />
          </div>
          <p className="text-sm font-bold text-slate-500">Total Layanan</p>
        </div>
        <p className="text-3xl font-black text-slate-800 tabular-nums">
          {serviceCount ?? 0}
        </p>
        <p className="text-xs font-medium text-slate-400 mt-2">
          Layanan aktif di sistem
        </p>
      </div>

      {/* Metric 2 */}
      <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Users className="h-5 w-5" />
          </div>
          <p className="text-sm font-bold text-slate-500">Pengguna</p>
        </div>
        <p className="text-3xl font-black text-slate-800 tabular-nums">
          {userCount ?? 0}
        </p>
        <p className="text-xs font-medium text-slate-400 mt-2">
          Total akun terdaftar
        </p>
      </div>

      {/* Metric 3 */}
      <div className="rounded-2xl border border-amber-200/60 bg-white p-5 shadow-sm transition-shadow hover:shadow-md ring-1 ring-amber-100/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <FileClock className="h-5 w-5" />
          </div>
          <p className="text-sm font-bold text-amber-700">Perlu Diproses</p>
        </div>
        <p className="text-3xl font-black text-amber-600 tabular-nums">
          {needAction}
        </p>
        <p className="text-xs font-medium text-amber-500 mt-2">
          Menunggu tindakan admin
        </p>
      </div>

      {/* Metric 4 */}
      <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <TrendingUp className="h-5 w-5" />
          </div>
          <p className="text-sm font-bold text-slate-500">Total Pengajuan</p>
        </div>
        <p className="text-3xl font-black text-slate-800 tabular-nums">
          {totalRequests}
        </p>
        <p className="text-xs font-medium text-slate-400 mt-2">
          Seluruh siklus pengajuan
        </p>
      </div>
    </div>
  );
}
