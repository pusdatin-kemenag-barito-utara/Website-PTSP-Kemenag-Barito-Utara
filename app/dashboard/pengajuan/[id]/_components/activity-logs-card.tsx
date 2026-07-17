"use client";

import { History as HistoryIcon, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ActivityLogsCardProps {
  activityLogs: any[];
}

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

export function ActivityLogsCard({ activityLogs }: ActivityLogsCardProps) {
  return (
    <div className="rounded-xl bg-white shadow-sm border border-slate-200 overflow-hidden">
      <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center gap-3">
        <HistoryIcon className="h-5 w-5 text-slate-500" />
        <h3 className="text-base font-semibold text-slate-900">
          Log Aktivitas
        </h3>
      </div>

      <div className="px-6 py-6">
        <div className="space-y-6">
          {(activityLogs ?? []).map((log: any, idx: number) => (
            <div key={log.id} className="relative pl-6 group">
              {/* Timeline line */}
              {idx !== activityLogs.length - 1 && (
                <div className="absolute left-[7px] top-[24px] bottom-[-24px] w-px bg-slate-200" />
              )}
              {/* Timeline dot */}
              <div className="absolute left-0 top-1.5 h-4 w-4 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center group-hover:border-emerald-500 transition-colors">
                <div className="h-1 w-1 rounded-full bg-slate-300 group-hover:bg-emerald-500 transition-colors" />
              </div>

              <p className="text-sm font-semibold text-slate-800 transition-colors">
                {formatAction(log.action)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {log.notes || "Sistem memproses status otomatis"}
              </p>
              <p className="mt-1.5 flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                <Calendar className="h-3 w-3" />
                {formatDate(log.createdAt)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
