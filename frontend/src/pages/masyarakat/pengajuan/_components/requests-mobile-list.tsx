import Link from "@/lib/next-compat/link";
import { Inbox, Calendar, ExternalLink, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { DeleteRequestButton } from "@/components/dashboard/delete-request-button";

interface RequestsMobileListProps {
  requests: any[];
}

export function RequestsMobileList({ requests }: RequestsMobileListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyTicket = (ticketNumber: string, id: string) => {
    navigator.clipboard.writeText(ticketNumber);
    setCopiedId(id);
    toast.success("Nomor Tiket Berhasil Disalin!", {
      description: ticketNumber,
      duration: 2500,
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (requests.length === 0) {
    return (
      <div className="px-6 py-16 text-center dark:bg-slate-900 transition-colors duration-300">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <div className="h-16 w-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center">
            <Inbox className="h-8 w-8 text-emerald-600 dark:text-emerald-400 opacity-60" />
          </div>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
            Belum ada pengajuan layanan.
          </p>
          <Link
            href="/masyarakat/pengajuan/baru"
            className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 hover:underline underline-offset-4"
          >
            Mulai Pengajuan Pertama Anda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800 dark:bg-slate-900 transition-colors duration-300">
      {requests.map((request: any) => {
        const requestNumber = request.requestNumber || request.request_number || "-";
        const createdAt = request.createdAt || request.created_at || "";
        const serviceName = request.serviceName || request.service_name || request.services?.name || "-";
        const itemName = request.itemName || request.item_name || request.serviceItems?.name || "";

        return (
          <div key={request.id} className="p-4 sm:p-5 flex flex-col gap-3.5">
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 truncate">
                    {requestNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyTicket(requestNumber, request.id)}
                    className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all shrink-0"
                    title="Salin Nomor Tiket"
                  >
                    {copiedId === request.id ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                  <Calendar className="h-3 w-3 shrink-0" />
                  {formatDate(createdAt)}
                </div>
              </div>
              <StatusBadge status={request.status} />
            </div>

            <div className="flex flex-col gap-0.5 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 line-clamp-1">
                {serviceName}
              </span>
              {itemName && (
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 line-clamp-1">
                  {itemName}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <Link
                href={`/masyarakat/pengajuan/${request.id}`}
                className="inline-flex h-9 px-4 items-center justify-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-all shadow-2xs active:scale-95"
              >
                <span>Detail</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
              <DeleteRequestButton
                requestId={request.id}
                status={request.status}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
