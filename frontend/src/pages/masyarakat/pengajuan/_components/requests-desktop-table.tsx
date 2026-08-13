import Link from "@/lib/next-compat/link";
import { Inbox, Calendar, ExternalLink, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { DeleteRequestButton } from "@/components/dashboard/delete-request-button";

interface RequestsDesktopTableProps {
  requests: any[];
}

export function RequestsDesktopTable({ requests }: RequestsDesktopTableProps) {
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
      <div className="px-8 py-20 text-center dark:bg-slate-900 transition-colors duration-300">
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <div className="h-20 w-20 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center">
              <Inbox className="h-10 w-10 text-emerald-600 dark:text-emerald-400 opacity-80" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-white dark:bg-slate-900 shadow-md flex items-center justify-center border border-emerald-100 dark:border-slate-800">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
              Belum Ada Pengajuan Layanan
            </h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              Anda belum memiliki berkas pengajuan aktif. Silakan pilih jenis layanan keagamaan yang Anda butuhkan untuk membuat pengajuan baru.
            </p>
          </div>
          <Link
            href="/masyarakat/pengajuan/baru"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95 mt-2"
          >
            <span>Mulai Pengajuan Sekarang</span>
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
          {requests.map((request: any) => {
            const requestNumber = request.requestNumber || request.request_number || "-";
            const createdAt = request.createdAt || request.created_at || "";
            const serviceName = request.serviceName || request.service_name || request.services?.name || "-";
            const itemName = request.itemName || request.item_name || request.serviceItems?.name || "";

            return (
              <tr
                key={request.id}
                className="hover:bg-slate-50/50 transition-all duration-300 group"
              >
                <td className="px-8 py-6">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900 tracking-tight group-hover:text-[#059669] transition-colors">
                        {requestNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyTicket(requestNumber, request.id)}
                        className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
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
                      <Calendar className="h-3 w-3" />
                      {formatDate(createdAt)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-6 max-w-[300px]">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-800 line-clamp-1">
                      {serviceName}
                    </span>
                    {itemName && (
                      <span className="text-[10px] font-bold text-slate-400 line-clamp-1 mt-0.5">
                        {itemName}
                      </span>
                    )}
                  </div>
                </td>

              <td className="px-6 py-6 whitespace-nowrap">
                <StatusBadge status={request.status} />
              </td>
              <td className="px-8 py-6 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/masyarakat/pengajuan/${request.id}`}
                    className="inline-flex h-9 px-4 items-center justify-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 text-xs font-bold transition-all shadow-2xs active:scale-95"
                    title="Lihat Detail Pengajuan"
                  >
                    <span>Detail</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                  <DeleteRequestButton
                    requestId={request.id}
                    status={request.status}
                  />
                </div>
              </td>
            </tr>
          );
        })}

        </tbody>
      </table>
    </div>
  );
}
