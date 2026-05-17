"use client";

import Link from "next/link";
import { Inbox, Calendar, ExternalLink } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { EditAnswersDialog } from "@/components/dashboard/edit-answers-dialog";
import { DeleteRequestButton } from "@/components/dashboard/delete-request-button";

interface RequestsDesktopTableProps {
  requests: any[];
}

export function RequestsDesktopTable({ requests }: RequestsDesktopTableProps) {
  if (requests.length === 0) {
    return (
      <div className="px-8 py-24 text-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="h-24 w-24 rounded-[2rem] bg-emerald-50 flex items-center justify-center rotate-12 group-hover:rotate-0 transition-transform duration-500">
              <Inbox className="h-12 w-12 text-emerald-600 opacity-40 -rotate-12" />
            </div>
            <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-white shadow-xl flex items-center justify-center border border-emerald-50">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-black text-slate-800">
              Belum ada pengajuan layanan.
            </p>
            <p className="text-xs font-bold text-slate-400 max-w-xs mx-auto leading-relaxed">
              Silakan pilih layanan yang tersedia untuk memulai pengajuan pertama Anda.
            </p>
          </div>
          <Link
            href="/dashboard/pengajuan/baru"
            className="inline-flex items-center px-6 py-3 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
          >
            Mulai Pengajuan Sekarang
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-100">
            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
              Nomor & Tanggal
            </th>
            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
              Layanan
            </th>
            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
              Status
            </th>
            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 text-right">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {requests.map((request: any) => (
            <tr
              key={request.id}
              className="hover:bg-slate-50/50 transition-all duration-300 group"
            >
              <td className="px-8 py-6">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-black text-slate-900 tracking-tight group-hover:text-[#059669] transition-colors">
                    {request.requestNumber}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                    <Calendar className="h-3 w-3" />
                    {formatDate(request.createdAt)}
                  </div>
                </div>
              </td>
              <td className="px-6 py-6 max-w-[300px]">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-slate-800 line-clamp-1">
                    {request.services?.name}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 line-clamp-1 mt-0.5">
                    {request.serviceItems?.name}
                  </span>
                </div>
              </td>
              <td className="px-6 py-6 whitespace-nowrap">
                <StatusBadge status={request.status} />
              </td>
              <td className="px-8 py-6 text-right">
                <div className="flex items-center justify-end gap-2">
                  <EditAnswersDialog
                    requestId={request.id}
                    answers={request.serviceRequestAnswers ?? []}
                    documents={request.serviceRequestDocuments ?? []}
                    disabled={
                      !["submitted", "under_review", "revision_required"].includes(
                        request.status,
                      )
                    }
                  />
                  <DeleteRequestButton
                    requestId={request.id}
                    status={request.status}
                  />
                  <Link
                    href={`/dashboard/pengajuan/${request.id}`}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#059669] hover:bg-[#059669] hover:text-white transition-all shadow-sm hover:shadow-emerald-500/20 active:scale-95"
                    title="Lihat Detail"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
