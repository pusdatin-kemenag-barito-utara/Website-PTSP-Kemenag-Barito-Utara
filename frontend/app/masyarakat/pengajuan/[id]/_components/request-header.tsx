"use client";

import Link from "next/link";
import { ArrowLeft, Clock, Calendar, CheckCircle2, FileText, Layers } from "lucide-react";
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

export function RequestHeader({ request, backUrl = "/masyarakat/pengajuan", cutiData, profile, pejabatList }: RequestHeaderProps) {
  return (
    <div className="space-y-4 sm:space-y-5">
      <Link
        href={backUrl}
        className="group inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        <span>Kembali ke Riwayat Pengajuan</span>
      </Link>

      <section className="relative overflow-hidden rounded-2xl sm:rounded-[2rem] bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-5 sm:p-7 md:p-8 text-white shadow-xl border border-slate-800 transition-all">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-5 sm:gap-6">
          <div className="space-y-3 sm:space-y-4 flex-1 min-w-0">
            {/* Ticket & Status */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5 backdrop-blur-md border border-white/15">
                <FileText className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs sm:text-base font-black tracking-wider font-mono text-white">
                  {request.requestNumber}
                </span>
                <CopyButton
                  text={request.requestNumber}
                  className="text-white/70 hover:text-white hover:bg-white/10 h-6 w-6 shrink-0 p-0.5"
                />
              </div>
              <StatusBadge
                status={request.status}
                className="h-7 px-3 text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-sm"
              />
            </div>

            {/* Service & Item Name (Jenis Permohonan Ditonjolkan Besar) */}
            <div className="space-y-1">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-emerald-300/90 bg-white/10 px-2.5 py-0.5 rounded-md border border-white/10">
                {request.services?.name}
              </span>
              <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight pt-1">
                {request.serviceItems?.name || request.services?.name}
              </h1>
            </div>

            {/* Date Timestamps */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 border-t border-white/10 text-xs font-semibold text-slate-300">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                <span>Diajukan: {formatDate(request.createdAt)}</span>
              </div>
              {request.approvedAt && (
                <div className="flex items-center gap-1.5 text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Disetujui: {formatDate(request.approvedAt)}</span>
                </div>
              )}
            </div>
          </div>

          {cutiData && profile && pejabatList && (
            <div className="shrink-0 flex items-center justify-start md:justify-end w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
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
