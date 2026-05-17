"use client";

import { History } from "lucide-react";

export function TrackEmptyState() {
  return (
    <div className="rounded-[2.5rem] border-2 border-dashed border-slate-200 p-16 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <History className="h-10 w-10" />
      </div>
      <h3 className="text-lg font-bold text-slate-900">
        Belum Ada Pencarian
      </h3>
      <p className="mt-2 text-sm font-medium text-slate-400 max-w-xs mx-auto">
        Silakan masukkan nomor pendaftaran Anda pada kolom di atas untuk
        melihat status.
      </p>
    </div>
  );
}
