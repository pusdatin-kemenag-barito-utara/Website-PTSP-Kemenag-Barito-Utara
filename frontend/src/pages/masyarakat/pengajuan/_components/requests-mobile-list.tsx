import Link from "@/lib/next-compat/link";
import { Inbox, Calendar, ExternalLink, Copy, Check, Search, Filter } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { DeleteRequestButton } from "@/components/dashboard/delete-request-button";

interface RequestsMobileListProps {
  requests: any[];
}

export function RequestsMobileList({ requests }: RequestsMobileListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const handleCopyTicket = (ticketNumber: string, id: string) => {
    navigator.clipboard.writeText(ticketNumber);
    setCopiedId(id);
    toast.success("Nomor Tiket Disalin!", {
      description: ticketNumber,
      duration: 2000,
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const ticket = (req.requestNumber || req.request_number || "").toLowerCase();
      const service = (req.serviceName || req.service_name || req.services?.name || "").toLowerCase();
      const item = (req.itemName || req.item_name || req.serviceItems?.name || "").toLowerCase();
      const matchesSearch = !search || ticket.includes(search.toLowerCase()) || service.includes(search.toLowerCase()) || item.includes(search.toLowerCase());

      if (!matchesSearch) return false;

      const status = req.status || "";
      if (statusFilter === "all") return true;
      if (statusFilter === "pending") return ["submitted", "under_review", "in_process"].includes(status);
      if (statusFilter === "revision") return status === "revision_required";
      if (statusFilter === "finished") return ["approved", "completed", "rejected"].includes(status);
      return true;
    });
  }, [requests, search, statusFilter]);

  if (requests.length === 0) {
    return (
      <div className="px-6 py-14 text-center dark:bg-slate-900 transition-colors">
        <div className="flex flex-col items-center gap-3.5 text-slate-400">
          <div className="h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center">
            <Inbox className="h-7 w-7 text-emerald-600 dark:text-emerald-400 opacity-60" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
              Belum ada pengajuan layanan
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Buat permohonan baru untuk memulai pengurusan berkas.
            </p>
          </div>
          <Link
            href="/masyarakat/pengajuan/baru"
            className="mt-2 inline-flex items-center justify-center px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm active:scale-95 transition-all"
          >
            Mulai Pengajuan Pertama
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dark:bg-slate-900 transition-colors">
      {/* Mobile Search & Filter Toolbar */}
      <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 space-y-2.5 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nomor tiket atau layanan..."
            className="w-full h-9 pl-9 pr-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-[11px] font-bold">
          {[
            { id: "all", label: `Semua (${requests.length})` },
            {
              id: "pending",
              label: `Diproses (${requests.filter((r) => ["submitted", "under_review", "in_process"].includes(r.status)).length})`,
            },
            {
              id: "revision",
              label: `Revisi (${requests.filter((r) => r.status === "revision_required").length})`,
            },
            {
              id: "finished",
              label: `Selesai (${requests.filter((r) => ["approved", "completed", "rejected"].includes(r.status)).length})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg shrink-0 transition-all ${
                statusFilter === tab.id
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-xs font-medium">
          Tidak ada pengajuan yang sesuai pencarian atau filter.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredRequests.map((request: any) => {
            const requestNumber = request.requestNumber || request.request_number || "-";
            const createdAt = request.createdAt || request.created_at || "";
            const serviceName = request.serviceName || request.service_name || request.services?.name || "-";
            const itemName = request.itemName || request.item_name || request.serviceItems?.name || "";

            return (
              <div key={request.id} className="p-3.5 sm:p-4 flex flex-col gap-3">
                {/* Header: Ticket & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-900 dark:text-slate-100 font-mono tracking-tight">
                        {requestNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyTicket(requestNumber, request.id)}
                        className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-all shrink-0"
                        title="Salin Nomor Tiket"
                      >
                        {copiedId === request.id ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                      <Calendar className="h-2.5 w-2.5 shrink-0" />
                      {formatDate(createdAt)}
                    </div>
                  </div>
                  <StatusBadge status={request.status} />
                </div>

                {/* Service Name Box */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                    {serviceName}
                  </span>
                  {itemName && (
                    <span className="text-[10px] font-medium text-slate-400 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {itemName}
                    </span>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between pt-0.5">
                  <Link
                    href={`/masyarakat/pengajuan/${request.id}`}
                    className="inline-flex h-8 px-3.5 items-center justify-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold transition-all active:scale-95 border border-emerald-200/50 dark:border-emerald-800/50"
                  >
                    <span>Lihat Detail</span>
                    <ExternalLink className="h-3 w-3" />
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
      )}
    </div>
  );
}
