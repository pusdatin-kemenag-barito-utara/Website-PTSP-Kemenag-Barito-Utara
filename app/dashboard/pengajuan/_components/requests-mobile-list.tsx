"use client";

import Link from "next/link";
import { Inbox, Calendar, ExternalLink } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { EditAnswersDialog } from "@/components/dashboard/edit-answers-dialog";
import { DeleteRequestButton } from "@/components/dashboard/delete-request-button";

interface RequestsMobileListProps {
  requests: any[];
}

export function RequestsMobileList({ requests }: RequestsMobileListProps) {
  if (requests.length === 0) {
    return (
      <div className="px-6 py-16 text-center">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center">
            <Inbox className="h-8 w-8 opacity-20" />
          </div>
          <p className="text-sm font-bold text-slate-600">
            Belum ada pengajuan layanan.
          </p>
          <Link
            href="/dashboard/pengajuan/baru"
            className="text-[10px] font-black uppercase tracking-wider text-[#059669] hover:underline underline-offset-4"
          >
            Mulai Pengajuan Pertama Anda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {requests.map((request: any) => (
        <div key={request.id} className="p-5 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-sm font-black text-slate-900 truncate">
                {request.requestNumber}
              </span>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                <Calendar className="h-3 w-3" />
                {formatDate(request.createdAt)}
              </div>
            </div>
            <StatusBadge status={request.status} />
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-black text-slate-800 line-clamp-1">
              {request.services?.name}
            </span>
            <span className="text-[10px] font-bold text-slate-400 line-clamp-1">
              {request.serviceItems?.name}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
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
            </div>
            <Link
              href={`/dashboard/pengajuan/${request.id}`}
              className="inline-flex h-9 px-4 items-center justify-center rounded-xl bg-emerald-50 text-[#059669] text-[11px] font-bold transition-all shadow-sm active:scale-95"
            >
              Detail <ExternalLink className="ml-2 h-3 w-3" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
