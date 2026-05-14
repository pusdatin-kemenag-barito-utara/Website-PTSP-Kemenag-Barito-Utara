"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function PasswordCell({
  password,
  canView,
}: {
  password?: string;
  canView: boolean;
}) {
  const [visible, setVisible] = useState(false);
  if (!canView) return <span className="text-slate-300 text-xs italic">—</span>;
  if (!password)
    return (
      <span className="text-slate-400 text-xs italic">Tidak tersedia</span>
    );
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm text-slate-700 font-mono tabular-nums tracking-wide select-all">
        {visible ? password : "••••••••"}
      </span>
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="p-1 rounded-md text-slate-400 hover:text-[#059669] hover:bg-emerald-50 transition-colors"
        title={visible ? "Sembunyikan" : "Tampilkan"}
      >
        {visible ? (
          <EyeOff className="h-3.5 w-3.5" />
        ) : (
          <Eye className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}
