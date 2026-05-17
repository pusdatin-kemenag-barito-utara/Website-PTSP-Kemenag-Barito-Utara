"use client";

import { AlertCircle } from "lucide-react";

interface TrackErrorStateProps {
  message: string;
}

export function TrackErrorState({ message }: TrackErrorStateProps) {
  return (
    <div className="rounded-[2.5rem] bg-white border border-rose-100 p-12 text-center shadow-xl shadow-rose-500/5">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 text-rose-500">
        <AlertCircle className="h-10 w-10" />
      </div>
      <h3 className="text-lg font-bold text-slate-900">
        Permohonan Tidak Ditemukan
      </h3>
      <p className="mt-2 text-sm font-medium text-slate-500 max-w-md mx-auto leading-relaxed">
        {message}
      </p>
    </div>
  );
}
