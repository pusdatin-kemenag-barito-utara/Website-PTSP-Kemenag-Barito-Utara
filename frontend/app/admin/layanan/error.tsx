"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function LayananError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Layanan Page Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
      <div className="h-20 w-20 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
        <AlertTriangle className="h-10 w-10" />
      </div>
      <h2 className="text-xl font-black text-slate-800 mb-2">Terjadi Kesalahan di Halaman Layanan</h2>
      <div className="max-w-xl bg-slate-50 border border-slate-200 rounded-xl p-4 text-left mb-6 overflow-auto">
        <p className="text-sm font-bold text-slate-700 mb-1">Pesan Error:</p>
        <pre className="text-xs text-rose-600 whitespace-pre-wrap font-mono">
          {error.message || "Unknown error"}
          {"\n\nStack:\n"}
          {error.stack}
        </pre>
      </div>
      <button
        onClick={() => reset()}
        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm transition-all"
      >
        <RefreshCcw className="h-4 w-4" />
        Coba Lagi
      </button>
    </div>
  );
}
