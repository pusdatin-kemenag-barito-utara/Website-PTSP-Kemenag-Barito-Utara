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
    <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-hidden transition-colors">
      <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 px-5 py-4 flex items-center gap-3">
        <div className="h-8 w-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
          <HistoryIcon className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
          Riwayat & Log Aktivitas
        </h3>
      </div>

      <div className="p-5 sm:p-6">
        <div className="space-y-6">
          {(activityLogs ?? []).map((log: any, idx: number) => (
            <div key={log.id} className="relative pl-6 group">
              {/* Timeline line */}
              {idx !== activityLogs.length - 1 && (
                <div className="absolute left-[7px] top-[22px] bottom-[-24px] w-0.5 bg-slate-200 dark:bg-slate-800" />
              )}
              {/* Timeline dot */}
              <div className="absolute left-0 top-1.5 h-4 w-4 rounded-full bg-white dark:bg-slate-900 border-2 border-emerald-500 flex items-center justify-center shadow-xs">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
              </div>

              <div className="space-y-0.5">
                <p className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100">
                  {formatAction(log.action)}
                </p>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {log.notes || "Sistem memproses status otomatis"}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 pt-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(log.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
