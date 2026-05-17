"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import { DeleteRequestButton } from "@/components/dashboard/delete-request-button";
import { formatDate } from "@/lib/utils";

interface RequestHeaderProps {
  request: any;
}

export function RequestHeader({ request }: RequestHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/dashboard/pengajuan"
        className="group inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-[#059669] transition-colors"
      >
        <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
        Kembali ke Riwayat
      </Link>

      <section className="relative overflow-hidden rounded-[1.5rem] sm:rounded-[2.5rem] bg-gradient-to-br from-[#064e3b] via-[#059669] to-[#047857] p-5 sm:p-8 md:p-12 shadow-[0_20px_50px_-20px_rgba(4,120,87,0.4)]">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl animate-pulse" />

        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 backdrop-blur-md">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tighter">
                  {request.requestNumber}
                </h1>
                <CopyButton
                  text={request.requestNumber}
                  className="text-white hover:bg-white/10"
                />
              </div>
              <StatusBadge
                status={request.status}
                className="h-8 sm:h-9 px-3 sm:px-4 text-[9px] sm:text-[10px] font-black uppercase tracking-widest ring-2 ring-white shadow-lg"
              />
            </div>

            <div>
              <h2 className="text-lg font-black text-emerald-50 md:text-2xl tracking-tight leading-tight">
                {request.services?.name}
              </h2>
              <p className="mt-2 text-sm font-medium text-emerald-100/60 max-w-2xl leading-relaxed">
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

          <div className="shrink-0 pb-1">
            <DeleteRequestButton
              requestId={request.id}
              status={request.status}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
