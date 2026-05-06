import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { History, MessageSquare, Activity, User } from "lucide-react";
import { formatDate } from "@/lib/utils";

export function HistoryTimelineCard({ request }: { request: any }) {
  const combined = [
    ...(request.service_request_reviews || []).map((r: any) => ({
      ...r,
      type: "review",
    })),
    ...(request.activity_logs || []).map((l: any) => ({
      ...l,
      type: "log",
    })),
  ].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <Card title="Riwayat & Aktivitas" icon={History}>
      <div className="max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        <div className="relative pl-6 border-l-2 border-slate-100 space-y-6 before:absolute before:top-0 before:-left-[2px] before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-slate-200 before:to-transparent pb-4">
          {combined.length === 0 ? (
            <p className="text-sm text-slate-400 italic">Belum ada riwayat.</p>
          ) : (
            combined.map((item: any) => (
              <div key={`${item.type}-${item.id}`} className="relative">
                <div
                  className={`absolute -left-[35px] flex h-6 w-6 items-center justify-center rounded-full border-4 border-white shadow-sm ${
                    item.type === "review"
                      ? "bg-[#1f4bb7] text-white"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {item.type === "review" ? (
                    <MessageSquare className="h-2.5 w-2.5" />
                  ) : (
                    <Activity className="h-2.5 w-2.5" />
                  )}
                </div>
                <div
                  className={`rounded-2xl border p-4 shadow-sm ${
                    item.type === "review"
                      ? "bg-blue-50/30 border-blue-100"
                      : "bg-white border-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    {item.type === "review" ? (
                      <StatusBadge status={item.status} />
                    ) : (
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        Aktivitas
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-slate-400">
                      {formatDate(item.created_at)}
                    </span>
                  </div>

                  {item.type === "review" ? (
                    <>
                      <p className="text-sm font-medium text-slate-700">
                        {item.notes || (
                          <span className="italic text-slate-400">
                            Tidak ada catatan
                          </span>
                        )}
                      </p>
                      <p className="mt-2 text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                        <User className="h-3 w-3" />
                        Oleh: {item.profiles?.full_name || "-"}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-slate-800">
                        {item.action}
                      </p>
                      {item.notes && (
                        <p className="text-xs text-slate-500 mt-1 font-medium">
                          {item.notes}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
}
