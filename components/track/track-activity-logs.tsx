import { History } from "lucide-react";
import { formatDate } from "@/lib/utils";

export function TrackActivityLogs({ logs }: { logs: any[] }) {
  if (!logs || logs.length === 0) return null;

  return (
    <div className="rounded-[2rem] bg-white p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100">
      <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <History className="h-5 w-5 text-[#059669]" />
          Riwayat Aktivitas
        </span>
        <span className="text-xs font-medium text-slate-400">
          {logs.length} entri
        </span>
      </h3>
      <div className="relative max-h-[400px] overflow-y-auto pr-2 border-l-2 border-slate-100 ml-3 space-y-6 scrollbar-thin">
        {logs
          .sort(
            (a: any, b: any) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          )
          .map((log: any) => (
            <div key={log.id} className="relative pl-6">
              <div className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-2 border-white bg-[#059669] shadow-sm" />
              <div>
                <p className="text-sm font-bold text-slate-900">{log.action}</p>
                <p className="mt-0.5 text-[11px] font-semibold text-slate-400">
                  {formatDate(log.created_at)}
                </p>
                {log.notes && (
                  <p className="mt-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {log.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
