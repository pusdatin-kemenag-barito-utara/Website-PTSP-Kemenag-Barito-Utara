"use client";

import { History as HistoryIcon, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ActivityLogsCardProps {
  activityLogs: any[];
}

const ACTION_MAPPINGS: Record<string, string> = {
  submitted: "Pengajuan Dikirim",
  request_updated: "Pembaruan Data & Dokumen",
  revision_uploaded: "Dokumen Revisi Diunggah",
  review_submitted: "Peninjauan oleh Petugas",
  "Pemohon memperbarui data formulir": "Formulir Diperbarui",
};

function formatAction(action: string): string {
  return ACTION_MAPPINGS[action] || action;
}

export function ActivityLogsCard({ activityLogs }: ActivityLogsCardProps) {
  return (
    <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-sm border border-slate-200">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
          <HistoryIcon className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-black text-slate-900 tracking-tight">
          Log Aktivitas
        </h3>
      </div>

      <div className="space-y-6">
        {(activityLogs ?? []).map((log: any, idx: number) => (
          <div key={log.id} className="relative pl-8 group">
            {/* Timeline line */}
            {idx !== activityLogs.length - 1 && (
              <div className="absolute left-[15px] top-[26px] bottom-[-20px] w-0.5 bg-slate-100" />
            )}
            {/* Timeline dot */}
            <div className="absolute left-0 top-1.5 h-8 w-8 rounded-full bg-slate-50 border-4 border-white shadow-sm flex items-center justify-center group-hover:bg-emerald-50 group-hover:border-emerald-50 transition-colors">
              <div className="h-1.5 w-1.5 rounded-full bg-slate-300 group-hover:bg-emerald-500 transition-colors" />
            </div>

            <p className="text-xs font-black text-slate-800 tracking-tight group-hover:text-emerald-700 transition-colors">
              {formatAction(log.action)}
            </p>
            <p className="text-[10px] font-medium text-slate-500 leading-relaxed mt-1">
              {log.notes || "Sistem memproses status otomatis"}
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-300">
              <Calendar className="h-2.5 w-2.5" />
              {formatDate(log.createdAt)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
