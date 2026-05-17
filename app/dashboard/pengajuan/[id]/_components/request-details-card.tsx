"use client";

import { Info } from "lucide-react";

interface RequestDetailsCardProps {
  revisionNote?: string | null;
  rejectionReason?: string | null;
}

export function RequestDetailsCard({
  revisionNote,
  rejectionReason,
}: RequestDetailsCardProps) {
  return (
    <div className="rounded-2xl sm:rounded-[2.5rem] bg-white p-5 sm:p-8 shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <Info className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-black text-slate-900 tracking-tight">
          Detail Pengajuan
        </h3>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
              Catatan Revisi
            </p>
            <p
              className={`text-sm font-bold ${revisionNote ? "text-rose-600" : "text-slate-500 italic"}`}
            >
              {revisionNote || "Tidak ada catatan revisi"}
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
              Alasan Penolakan
            </p>
            <p
              className={`text-sm font-bold ${rejectionReason ? "text-rose-700" : "text-slate-500 italic"}`}
            >
              {rejectionReason || "Tidak ada alasan penolakan"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
