"use client";

import { Clock, CheckCircle2, AlertCircle } from "lucide-react";

export function RequestsInfoFooter() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="flex items-center gap-4 rounded-3xl bg-white border border-slate-100 p-6 shadow-sm">
        <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Clock className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Layanan Cepat
          </p>
          <p className="text-xs font-bold text-slate-700">
            Verifikasi 1-3 Hari Kerja
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4 rounded-3xl bg-white border border-slate-100 p-6 shadow-sm">
        <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Legalitas
          </p>
          <p className="text-xs font-bold text-slate-700">
            Dokumen Berbarcode Resmi
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4 rounded-3xl bg-white border border-slate-100 p-6 shadow-sm">
        <div className="h-10 w-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Support
          </p>
          <p className="text-xs font-bold text-slate-700">
            Helpdesk Siap Membantu
          </p>
        </div>
      </div>
    </div>
  );
}
