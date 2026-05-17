"use client";

import { Button } from "@/components/ui/button";

interface RequestConfirmationProps {
  isConfirmed: boolean;
  onConfirmChange: (value: boolean) => void;
  loading: boolean;
  error?: string;
}

export function RequestConfirmation({
  isConfirmed,
  onConfirmChange,
  loading,
  error,
}: RequestConfirmationProps) {
  return (
    <div className="flex flex-col gap-4 pt-4">
      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      <div
        className={`group flex cursor-pointer flex-col md:flex-row items-center md:items-start justify-center md:justify-start text-center md:text-left gap-3 sm:gap-4 rounded-2xl border-2 p-4 sm:p-5 transition-all duration-300 ${
          isConfirmed
            ? "border-emerald-500 bg-emerald-50/50 shadow-sm"
            : "border-slate-200 bg-white hover:border-emerald-300"
        }`}
        onClick={() => onConfirmChange(!isConfirmed)}
      >
        <div className="relative flex h-6 w-6 md:mt-1 shrink-0 items-center justify-center">
          <input
            type="checkbox"
            id="confirm-data"
            checked={isConfirmed}
            onChange={(e) => onConfirmChange(e.target.checked)}
            className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 border-slate-300 bg-white transition-all checked:border-emerald-500 checked:bg-emerald-500"
          />
          {isConfirmed && (
            <svg
              className="pointer-events-none absolute h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
        <div className="flex flex-col gap-1.5 md:gap-1 select-none">
          <label
            htmlFor="confirm-data"
            className={`text-base md:text-sm font-black md:font-bold leading-none transition-colors cursor-pointer ${
              isConfirmed ? "text-emerald-900" : "text-slate-800 md:text-slate-700"
            }`}
          >
            Saya menyatakan data sudah sesuai
          </label>
          <p className="text-xs font-medium text-slate-500 leading-relaxed max-w-sm md:max-w-none">
            Pastikan semua dokumen dan informasi yang Anda masukkan sudah
            benar sebelum dikirim.
          </p>
        </div>
      </div>

      <Button
        type="submit"
        className={`h-12 sm:h-14 w-full rounded-2xl text-sm sm:text-base font-bold transition-all duration-300 ${
          isConfirmed
            ? "bg-gradient-to-r from-[#059669] to-[#047857] text-white shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 active:scale-[0.98]"
            : "bg-slate-100 text-slate-400 cursor-not-allowed"
        }`}
        disabled={loading || !isConfirmed}
      >
        {loading ? "Sedang Mengirim..." : "Kirim Pengajuan Sekarang"}
      </Button>
    </div>
  );
}
