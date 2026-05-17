"use client";

import { StatusBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Calendar } from "lucide-react";

interface AdminDetailHeaderProps {
  request: any;
}

export function AdminDetailHeader({ request }: AdminDetailHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-200/50 bg-gradient-to-br from-emerald-600 to-emerald-900 shadow-xl shadow-emerald-900/10 p-8 sm:p-10">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-white/10 text-emerald-100 text-[11px] font-black tracking-widest uppercase backdrop-blur-md border border-white/10">
              Detail Pengajuan
            </span>
            <StatusBadge status={request.status} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {request.requestNumber}
          </h1>
          <p className="text-emerald-200 font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4 opacity-70" />
            Diajukan pada {formatDate(request.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
