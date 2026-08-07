"use client";

import { CheckCircle2, XCircle } from "lucide-react";

export function PasswordCell({
  hasPassword,
}: {
  hasPassword?: boolean;
}) {
  if (hasPassword === undefined) return <span className="text-slate-300 text-xs italic">—</span>;
  return hasPassword ? (
    <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
      <CheckCircle2 className="h-3 w-3" /> Tersimpan
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs text-slate-400">
      <XCircle className="h-3 w-3" /> Belum diset
    </span>
  );
}
