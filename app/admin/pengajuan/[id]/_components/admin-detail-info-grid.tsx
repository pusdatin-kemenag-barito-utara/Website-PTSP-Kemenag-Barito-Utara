"use client";

import { User, FileText, Hash } from "lucide-react";

interface AdminDetailInfoGridProps {
  request: any;
}

export function AdminDetailInfoGrid({ request }: AdminDetailInfoGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 -mt-4 relative z-20 px-4 sm:px-8">
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-[#059669]">
            <User className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pemohon
            </p>
            <p className="text-sm font-black text-slate-900 mt-0.5 line-clamp-1">
              {request.profiles?.fullName || "-"}
            </p>
            <p className="text-[11px] text-slate-500">
              {request.profiles?.email}
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Layanan
            </p>
            <p className="text-sm font-black text-slate-900 mt-0.5 line-clamp-1">
              {request.services?.name}
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-xl p-5 shadow-sm hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <Hash className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Item Layanan
            </p>
            <p className="text-sm font-black text-slate-900 mt-0.5 line-clamp-1">
              {request.serviceItems?.name || "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
