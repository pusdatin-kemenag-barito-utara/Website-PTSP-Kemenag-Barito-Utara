"use client";

import { Search } from "lucide-react";

export function UserTableHeader({
  title,
  subtitle,
  icon: Icon,
  iconColor,
  count,
  searchQuery,
  onSearchChange,
}: {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  iconColor: string;
  count: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}) {
  return (
    <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white px-5 py-4 flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 ${iconColor}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-black text-slate-800">{title}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="px-3 py-1 rounded-lg bg-slate-50 text-xs font-bold text-slate-500 border border-slate-200/60">
          {count} total
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari..."
            className="rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-700 w-48 transition-all focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 outline-none"
          />
        </div>
      </div>
    </div>
  );
}
