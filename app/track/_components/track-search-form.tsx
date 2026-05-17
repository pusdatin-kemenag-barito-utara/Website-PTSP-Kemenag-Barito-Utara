"use client";

import { Search } from "lucide-react";

interface TrackSearchFormProps {
  initialQuery: string;
}

export function TrackSearchForm({ initialQuery }: TrackSearchFormProps) {
  const currentYear = new Date().getFullYear();
  const displayValue = initialQuery.includes("-") ? initialQuery.split("-").pop() : initialQuery;

  return (
    <div className="mb-12">
      <form className="group relative flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors duration-300" />
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-emerald-600 select-none tracking-tight">
                PTSP-{currentYear}-
              </span>
              <div className="h-4 w-[2px] bg-slate-200 rounded-full" />
            </div>
          </div>
          <input
            type="text"
            name="q"
            defaultValue={displayValue}
            autoComplete="off"
            placeholder="000123"
            className="w-full rounded-2xl border-2 border-white bg-white py-5 pl-[10.5rem] pr-6 text-lg font-black text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 placeholder:text-slate-200"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-[64px] items-center justify-center rounded-2xl bg-emerald-600 px-10 text-[15px] font-black text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all active:scale-95"
        >
          Cari Sekarang
        </button>
      </form>
    </div>
  );
}
