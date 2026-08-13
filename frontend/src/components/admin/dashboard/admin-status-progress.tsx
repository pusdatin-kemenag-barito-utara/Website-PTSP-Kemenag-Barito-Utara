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
    <div className="lg:col-span-2 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Activity className="h-4 w-4 text-[#059669]" />
          {title}
        </h2>
        <Link
          href={href}
          className="text-xs font-bold text-[#059669] hover:text-emerald-700 transition-colors"
        >
          Lihat Rincian &rarr;
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
        {totalRequests === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
              <FolderKanban className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-sm font-bold text-slate-500">
              Belum ada pengajuan
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Data statistik akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
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
                color: "bg-emerald-500",
                text: "text-emerald-700",
                bg: "bg-emerald-50",
              },
            ].map((s: any) => (
              <div key={s.label}>
                <div className="flex items-end justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${s.color}`} />
                    <span className="text-sm font-bold text-slate-700">
                      {s.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-slate-900 tabular-nums leading-none">
                      {s.value}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 ml-1.5">
                      ({Math.round((s.value / totalRequests) * 100)}%)
                    </span>
                  </div>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${s.color} transition-all duration-1000 ease-out`}
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
