import Link from "@/lib/next-compat/link";
import { Activity, FolderKanban } from "lucide-react";

export function AdminStatusProgress({
  totalRequests,
  stats,
  title = "Status Progres Pengajuan",
  href = "/admin/pengajuan"
}: {
  totalRequests: number;
  stats: {
    submitted: number;
    underReview: number;
    revision: number;
    finished: number;
  };
  title?: string;
  href?: string;
}) {
  return (
    <div className="lg:col-span-2 space-y-2.5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-emerald-600" />
          {title}
        </h2>
        <Link
          href={href}
          className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          Lihat Rincian &rarr;
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm">
        {totalRequests === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="h-9 w-9 rounded-full bg-slate-50 flex items-center justify-center mb-2">
              <FolderKanban className="h-4 w-4 text-slate-400" />
            </div>
            <p className="text-xs font-bold text-slate-600">
              Belum ada pengajuan
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Data statistik progres akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {[
              {
                label: "Masuk / Menunggu",
                value: stats.submitted,
                color: "bg-emerald-500",
                text: "text-emerald-700",
                bg: "bg-emerald-50",
              },
              {
                label: "Sedang Diproses",
                value: stats.underReview,
                color: "bg-amber-500",
                text: "text-amber-700",
                bg: "bg-amber-50",
              },
              {
                label: "Perlu Revisi Pemohon",
                value: stats.revision,
                color: "bg-rose-500",
                text: "text-rose-700",
                bg: "bg-rose-50",
              },
              {
                label: "Selesai / Disetujui",
                value: stats.finished,
                color: "bg-teal-600",
                text: "text-teal-700",
                bg: "bg-teal-50",
              },
            ].map((s: any) => (
              <div key={s.label}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${s.color}`} />
                    <span className="text-xs font-semibold text-slate-700">
                      {s.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-900 tabular-nums leading-none">
                      {s.value}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400 ml-1">
                      ({Math.round((s.value / totalRequests) * 100)}%)
                    </span>
                  </div>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${s.color} transition-all duration-700 ease-out`}
                    style={{
                      width: `${Math.round((s.value / totalRequests) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
