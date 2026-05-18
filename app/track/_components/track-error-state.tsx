"use client";

import { AlertCircle } from "lucide-react";

interface TrackErrorStateProps {
  message: string;
}

export function TrackErrorState({ message }: TrackErrorStateProps) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-rose-150/60 bg-rose-50/20 backdrop-blur-md p-10 md:p-12 text-center shadow-[0_12px_30px_-5px_rgba(244,63,94,0.03)]">
      {/* Decorative inner circular glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-rose-500/[0.02] rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-5">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 border border-rose-100 text-rose-500 shadow-sm">
          <AlertCircle className="h-7 w-7 animate-pulse" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-slate-800 tracking-tight">
            Permohonan Tidak Ditemukan
          </h3>
          <p className="text-xs font-semibold text-rose-600/90 max-w-md mx-auto leading-relaxed bg-rose-50/50 border border-rose-100/50 p-3 rounded-xl">
            {message}
          </p>
          <p className="text-[10px] font-medium text-slate-400 max-w-xs mx-auto pt-1 leading-normal">
            Pastikan format nomor pendaftaran benar dan lengkap (misalnya bagian angka setelah tanda hubung).
          </p>
        </div>
      </div>
    </div>
  );
}
