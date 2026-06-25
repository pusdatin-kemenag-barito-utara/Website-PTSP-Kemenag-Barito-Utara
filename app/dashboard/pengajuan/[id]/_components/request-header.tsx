"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import { formatDate } from "@/lib/utils";

interface RequestHeaderProps {
  request: any;
  backUrl?: string;
}

export function RequestHeader({ request, backUrl = "/dashboard/pengajuan" }: RequestHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <Link
        href={backUrl}
        className="group inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-[#059669] transition-colors"
      >
        <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
        Kembali ke Riwayat
      </Link>

      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#064e3b] via-[#059669] to-[#047857] p-5 sm:p-6 shadow-md border border-[#047857]/50">
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-5 md:gap-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl bg-white/10 border border-white/20 px-3 py-1.5 backdrop-blur-sm">
                <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  {request.requestNumber}
                </h1>
                <CopyButton
                  text={request.requestNumber}
                  className="text-white hover:bg-white/10 h-7 w-7"
                />
              </div>
              <StatusBadge
                status={request.status}
                className="h-8 px-3 text-[10px] font-bold uppercase tracking-wider ring-1 ring-white/30 shadow-sm"
              />
            </div>

            <div>
              <h2 className="text-base font-bold text-emerald-50 md:text-lg tracking-tight">
                {request.services?.name}
              </h2>
              <p className="mt-1 text-xs font-medium text-emerald-100/70">
                {request.serviceItems?.name}
              </p>
            </div>

            <div className="flex flex-wrap gap-6 pt-2">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200/50">
                  Diajukan
                </span>
                <span className="text-xs font-black text-white">
                  {formatDate(request.createdAt)}
                </span>
              </div>
              {request.approvedAt && (
                <div className="flex flex-col gap-1 border-l border-white/10 pl-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-200/50">
                    Disetujui
                  </span>
                  <span className="text-xs font-black text-white">
                    {formatDate(request.approvedAt)}
                  </span>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
