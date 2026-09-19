import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { History, MessageSquare, Activity, User } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ActivityLogActions } from "./activity-log-actions";

const ACTION_MAPPINGS: Record<string, string> = {
  submitted: "Pengajuan Dikirim",
  request_created: "Pengajuan Baru Dibuat",
  request_updated: "Pembaruan Data & Dokumen",
  revision_uploaded: "Dokumen Revisi Diunggah",
  review_submitted: "Peninjauan oleh Petugas",
  "Pemohon memperbarui data formulir": "Formulir Diperbarui",
  "status:approved": "Status: Disetujui",
  "status:rejected": "Status: Ditolak",
  "status:under_review": "Status: Sedang Ditinjau",
  "status:revision_required": "Status: Perlu Revisi",
  "status:completed": "Status: Selesai",
  "SETUJUI_CUTI_ATASAN": "Cuti Disetujui (Atasan)",
  "SETUJUI_CUTI_KEPALA": "Cuti Disetujui (Kepala Kantor)",
  "TOLAK_CUTI_ATASAN": "Cuti Ditolak (Atasan)",
  "TOLAK_CUTI_KEPALA": "Cuti Ditolak (Kepala Kantor)",
  "manual_document_uploaded": "Dokumen Hasil Diunggah",
  "KIRIM_WA_HASIL": "Notifikasi WhatsApp Dikirim",
};

function formatAction(action: string): string {
  return ACTION_MAPPINGS[action] || action;
}

export function HistoryTimelineCard({ request }: { request: any }) {
  const combined = [
    ...(request.serviceRequestReviews || []).map((r: any) => ({
      ...r,
      type: "review",
    })),
    ...(request.activityLogs || []).map((l: any) => ({
      ...l,
      type: "log",
    })),
  ].sort(
    (a, b) =>
      new Date(b.createdAt || b.created_at || 0).getTime() -
      new Date(a.createdAt || a.created_at || 0).getTime(),
  );

  return (
    <Card title="Riwayat & Aktivitas" icon={History}>
      <div className="max-h-[360px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        <div className="relative pl-5 border-l-2 border-slate-100 space-y-3.5 before:absolute before:top-0 before:-left-[2px] before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-slate-200 before:to-transparent pb-2">
          {combined.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">Belum ada riwayat tercatat.</p>
          ) : (
            combined.map((item: any) => (
              <div key={`${item.type}-${item.id}`} className="relative">
                <div
                  className={`absolute -left-[30px] flex h-5 w-5 items-center justify-center rounded-full border-2 border-white shadow-2xs ${
                    item.type === "review"
                      ? "bg-[#059669] text-white"
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
                  className={`rounded-xl border p-2.5 sm:p-3 shadow-2xs transition-all ${
                    item.type === "review"
                      ? "bg-emerald-50/30 border-emerald-100"
                      : "bg-white border-slate-100 hover:border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    {item.type === "review" ? (
                      <StatusBadge status={item.status} />
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                        Aktivitas
                      </span>
                    )}
                    <span className="text-[10px] font-medium text-slate-400">
                      {formatDate(item.createdAt || item.created_at)}
                    </span>
                  </div>

                  {item.type === "review" ? (
                    <>
                      <p className="text-xs font-medium text-slate-700 leading-snug">
                        {item.notes || (
                          <span className="italic text-slate-400">
                            Tanpa catatan tambahan
                          </span>
                        )}
                      </p>
                      <p className="mt-1.5 text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Oleh: {item.reviewer_name || item.reviewerName || item.profiles?.fullName || "Petugas PTSP"}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs font-bold text-slate-800 leading-snug">
                        {formatAction(item.action)}
                      </p>
                      <ActivityLogActions
                        logId={item.id.toString()}
                        requestId={item.requestId}
                        initialNotes={item.notes}
                      />
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
