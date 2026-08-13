import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";

interface MasyarakatRequestConfirmationProps {
  isConfirmed: boolean;
  onConfirmChange: (value: boolean) => void;
  loading: boolean;
  error?: string;
}

export function MasyarakatRequestConfirmation({
  isConfirmed,
  onConfirmChange,
  loading,
  error,
}: MasyarakatRequestConfirmationProps) {
  return (
    <div className="flex flex-col gap-4 pt-2">
      {error && (
        <p className="rounded-xl bg-rose-50 dark:bg-rose-950/60 p-4 text-xs font-bold text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40">
          {error}
        </p>
      )}

      <div
        className={`group flex cursor-pointer flex-col md:flex-row items-center md:items-start justify-center md:justify-start text-center md:text-left gap-3 sm:gap-4 rounded-2xl border p-4 sm:p-5 transition-all duration-300 ${
          isConfirmed
            ? "border-emerald-500/80 bg-emerald-50/60 dark:bg-emerald-950/40 shadow-xs"
            : "border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-400 dark:hover:border-emerald-600"
        }`}
        onClick={() => onConfirmChange(!isConfirmed)}
      >
        <div className="relative flex h-6 w-6 md:mt-0.5 shrink-0 items-center justify-center">
          <input
            type="checkbox"
            id="confirm-data-masyarakat"
            checked={isConfirmed}
            onChange={(e) => onConfirmChange(e.target.checked)}
            className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 transition-all checked:border-emerald-500 checked:bg-emerald-500"
          />
          {isConfirmed && (
            <svg
              className="pointer-events-none absolute h-3.5 w-3.5 text-white"
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
        <div className="flex flex-col gap-1 select-none">
          <label
            htmlFor="confirm-data-masyarakat"
            className={`text-xs sm:text-sm font-bold leading-snug transition-colors cursor-pointer ${
              isConfirmed
                ? "text-emerald-900 dark:text-emerald-200"
                : "text-slate-800 dark:text-slate-200"
            }`}
          >
            Saya menyatakan data & dokumen yang diisi adalah benar dan dapat dipertanggungjawabkan.
          </label>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Pastikan seluruh bidang form dan lampiran persyaratan sudah diunggah secara lengkap sebelum mengirim.
          </p>
        </div>
      </div>

      <Button
        type="submit"
        disabled={!isConfirmed || loading}
        className="relative group overflow-hidden w-full h-13 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:via-emerald-400 hover:to-teal-500 font-extrabold text-white text-sm shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:shadow-emerald-500/35 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none cursor-pointer border border-emerald-400/30"
      >
        {/* Subtle shimmer glow effect */}
        <span className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

        {loading ? (
          <span className="flex items-center justify-center gap-2.5">
            <Loader2 className="h-5 w-5 animate-spin text-white" />
            <span className="tracking-wide">Memproses Pengajuan...</span>
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2.5">
            <Send className="h-4.5 w-4.5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5" />
            <span className="tracking-wide">Kirim Pengajuan Sekarang</span>
          </span>
        )}
      </Button>
    </div>
  );
}
