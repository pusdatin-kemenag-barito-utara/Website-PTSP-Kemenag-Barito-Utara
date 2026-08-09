"use client";

import { UserCircle, Briefcase, FileSignature } from "lucide-react";

interface AdminDetailInfoGridProps {
  request: any;
}

export function AdminDetailInfoGrid({ request }: AdminDetailInfoGridProps) {
  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-4 sm:mt-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <UserCircle className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pemohon
            </p>
            <p className="text-xs sm:text-sm font-black text-slate-800 mt-0.5 truncate">
              {request.profiles?.fullName || "-"}
            </p>
            <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">
              {request.profiles?.email}
            </p>
          </div>
        </div>
      </div>
      
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Briefcase className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
              Layanan
            </p>
            <p className="text-xs sm:text-sm font-black text-slate-800 mt-0.5 truncate">
              {request.services?.name}
            </p>
          </div>
        </div>
      </div>
      
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-5 shadow-sm hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
            <FileSignature className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
              Item Layanan
            </p>
            <p className="text-xs sm:text-sm font-black text-slate-800 mt-0.5 truncate">
              {request.serviceItems?.name || "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
