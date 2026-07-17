"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import { formatDate } from "@/lib/utils";
import { CutiDraftButton } from "@/components/ui/cuti-draft-button";

interface RequestHeaderProps {
  request: any;
  backUrl?: string;
  cutiData?: any;
  profile?: any;
  pejabatList?: any[];
}

export function RequestHeader({ request, backUrl = "/dashboard/pengajuan", cutiData, profile, pejabatList }: RequestHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <Link
        href={backUrl}
        className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Kembali ke Riwayat
      </Link>

      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 sm:gap-6">
          <div className="space-y-3 sm:space-y-4 flex-1">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-2xl font-bold text-slate-900 font-mono tracking-tight">
                  {request.requestNumber}
                </h1>
                <CopyButton
                  text={request.requestNumber}
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 h-8 w-8 shrink-0"
                />
              </div>
              <StatusBadge
                status={request.status}
                className="h-6 sm:h-7 px-2.5 sm:px-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider"
              />
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-800">
                {request.services?.name}
              </h2>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
                {request.serviceItems?.name}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 sm:gap-8 pt-1 sm:pt-2">
              <div className="space-y-1">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Diajukan
                </span>
                <p className="text-xs sm:text-sm font-semibold text-slate-800">
                  {formatDate(request.createdAt)}
                </p>
              </div>
              {request.approvedAt && (
                <div className="space-y-1 border-l border-slate-200 pl-4 sm:pl-8">
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Disetujui
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800">
                    {formatDate(request.approvedAt)}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {cutiData && profile && pejabatList && (
            <div className="shrink-0 flex items-center justify-start md:justify-end mt-2 md:mt-0 w-full md:w-auto">
              <CutiDraftButton 
                cuti={cutiData} 
                profile={profile} 
                pejabatList={pejabatList} 
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
