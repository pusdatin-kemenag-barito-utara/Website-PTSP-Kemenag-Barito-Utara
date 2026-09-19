import { useState, useMemo } from "react";
import Link from "@/lib/next-compat/link";
import {
  Inbox,
  Calendar,
  ExternalLink,
  Copy,
  Check,
  Search,
  X,
  Clock,
  AlertCircle,
  CheckCircle2,
  FolderKanban,
} from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { DeleteRequestButton } from "@/components/dashboard/delete-request-button";

interface RequestsViewProps {
  requests: any[];
  userId?: string;
}

export function RequestsView({ requests = [], userId }: RequestsViewProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const handleCopyTicket = (ticketNumber: string, id: string) => {
    navigator.clipboard.writeText(ticketNumber);
    setCopiedId(id);
    toast.success("Nomor Tiket Disalin!", {
      description: ticketNumber,
      duration: 1500,
    });
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Hitung statistik untuk filter cards
  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) =>
      ["submitted", "under_review", "in_process"].includes(r.status || "")
    ).length;
    const revision = requests.filter(
      (r) => (r.status || "") === "revision_required"
    ).length;
    const finished = requests.filter((r) =>
      ["approved", "completed"].includes(r.status || "")
    ).length;

    return { total, pending, revision, finished };
  }, [requests]);

  // Filter requests berdasarkan search & status tab
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const ticket = (req.requestNumber || req.request_number || "").toLowerCase();
      const service = (
        req.serviceName ||
        req.service_name ||
        req.services?.name ||
        ""
      ).toLowerCase();
      const item = (
        req.itemName ||
        req.item_name ||
        req.serviceItems?.name ||
        ""
      ).toLowerCase();

      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        ticket.includes(q) ||
        service.includes(q) ||
        item.includes(q);

      if (!matchesSearch) return false;

      const status = req.status || "";
      if (statusFilter === "all") return true;
      if (statusFilter === "pending")
        return ["submitted", "under_review", "in_process"].includes(status);
      if (statusFilter === "revision") return status === "revision_required";
      if (statusFilter === "finished")
        return ["approved", "completed"].includes(status);

      return true;
    });
  }, [requests, search, statusFilter]);

  const statCards = [
    {
      id: "all",
      label: "Total Pengajuan",
      count: stats.total,
      icon: FolderKanban,
      color: "text-slate-900 dark:text-white",
      activeBorder: "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 ring-1 ring-emerald-500/20",
    },
    {
      id: "pending",
      label: "Sedang Diproses",
      count: stats.pending,
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      activeBorder: "border-amber-500 bg-amber-50/40 dark:bg-amber-950/20 ring-1 ring-amber-500/20",
    },
    {
      id: "revision",
      label: "Perlu Revisi",
      count: stats.revision,
      icon: AlertCircle,
      color: "text-rose-600 dark:text-rose-400",
      activeBorder: "border-rose-500 bg-rose-50/40 dark:bg-rose-950/20 ring-1 ring-rose-500/20",
    },
    {
      id: "finished",
      label: "Selesai",
      count: stats.finished,
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      activeBorder: "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 ring-1 ring-emerald-500/20",
    },
  ];

  return (
    <div className="space-y-4">
      {/* 1. Simple, Clean Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          const isActive = statusFilter === card.id;

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => setStatusFilter(card.id)}
              className={`p-3 sm:p-4 rounded-xl border text-left transition-all cursor-pointer bg-white dark:bg-slate-900 shadow-2xs ${
                isActive
                  ? card.activeBorder
                  : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {card.label}
                </span>
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
              </div>
              <p className={`mt-1.5 sm:mt-2 text-2xl sm:text-3xl font-bold ${card.color} tracking-tight`}>
                {card.count}
              </p>
            </button>
          );
        })}
      </div>

      {/* 2. Main Table & List Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        {/* Search & Tabs Toolbar: Stacked on mobile without horizontal scroll */}
        <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-72 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nomor tiket atau layanan..."
              className="w-full h-9 pl-9 pr-8 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter Tabs: Fits in 4 equal columns on mobile (NO horizontal scroll!), flex inline on desktop */}
          <div className="w-full sm:w-auto grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl sm:bg-transparent sm:dark:bg-transparent sm:p-0 sm:flex sm:items-center sm:gap-1.5">
            {[
              { id: "all", label: "Semua", count: stats.total },
              { id: "pending", label: "Diproses", count: stats.pending },
              { id: "revision", label: "Revisi", count: stats.revision },
              { id: "finished", label: "Selesai", count: stats.finished },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`py-1.5 px-1 sm:px-3 rounded-lg text-center text-[11px] sm:text-xs font-bold transition-all cursor-pointer truncate ${
                  statusFilter === tab.id
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 sm:bg-slate-100 sm:dark:bg-slate-800"
                }`}
                title={`${tab.label} (${tab.count})`}
              >
                <span>{tab.label}</span>
                <span className="ml-1 opacity-80">({tab.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Empty State: No requests */}
        {requests.length === 0 ? (
          <div className="py-14 px-6 text-center text-slate-500 dark:text-slate-400">
            <Inbox className="h-10 w-10 mx-auto text-slate-400 mb-3" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Belum ada riwayat pengajuan
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Silakan buat pengajuan layanan baru.
            </p>
          </div>
        ) : filteredRequests.length === 0 ? (
          /* Empty State: Filter result 0 */
          <div className="py-12 px-6 text-center text-slate-400">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Tidak ada pengajuan yang sesuai.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
              className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          /* 4. Requests List: Desktop Table */
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-5 py-3.5">Nomor & Tanggal</th>
                    <th className="px-5 py-3.5">Layanan</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredRequests.map((request: any) => {
                    const requestNumber =
                      request.requestNumber || request.request_number || "-";
                    const createdAt =
                      request.createdAt || request.created_at || request.submittedAt || "";
                    const serviceName =
                      request.serviceName ||
                      request.service_name ||
                      request.services?.name ||
                      "-";
                    const itemName =
                      request.itemName ||
                      request.item_name ||
                      request.serviceItems?.name ||
                      "";

                    return (
                      <tr
                        key={request.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        {/* Nomor & Tanggal */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                              {requestNumber}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleCopyTicket(requestNumber, request.id)
                              }
                              className="p-1 text-slate-400 hover:text-emerald-600 rounded cursor-pointer"
                              title="Salin Nomor Tiket"
                            >
                              {copiedId === request.id ? (
                                <Check className="h-3 w-3 text-emerald-600" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(createdAt)}</span>
                          </div>
                        </td>

                        {/* Layanan */}
                        <td className="px-5 py-3.5 max-w-[320px]">
                          <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                            {serviceName}
                          </p>
                          {itemName && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                              {itemName}
                            </p>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <StatusBadge status={request.status} />
                        </td>

                        {/* Aksi */}
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/masyarakat/pengajuan/${request.id}`}
                              className="inline-flex h-8 px-3 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
                            >
                              <span>Detail</span>
                              <ExternalLink className="h-3 w-3" />
                            </Link>

                            <DeleteRequestButton
                              requestId={request.id}
                              status={request.status}
                              userId={userId}
                              variant="solid"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards (< md) */}
            <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRequests.map((request: any) => {
                const requestNumber =
                  request.requestNumber || request.request_number || "-";
                const createdAt =
                  request.createdAt || request.created_at || request.submittedAt || "";
                const serviceName =
                  request.serviceName ||
                  request.service_name ||
                  request.services?.name ||
                  "-";
                const itemName =
                  request.itemName ||
                  request.item_name ||
                  request.serviceItems?.name ||
                  "";

                return (
                  <div key={request.id} className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                          {requestNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopyTicket(requestNumber, request.id)
                          }
                          className="p-1 text-slate-400 hover:text-emerald-600 rounded"
                        >
                          {copiedId === request.id ? (
                            <Check className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>

                      <StatusBadge status={request.status} />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {serviceName}
                      </p>
                      {itemName && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {itemName}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(createdAt)}</span>
                    </div>

                    {/* Action Buttons: Solid Green Detail & Solid Red Hapus */}
                    <div className="flex items-center gap-2 pt-1.5">
                      <Link
                        href={`/masyarakat/pengajuan/${request.id}`}
                        className="flex-1 inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
                      >
                        <span>Detail</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>

                      <DeleteRequestButton
                        requestId={request.id}
                        status={request.status}
                        userId={userId}
                        variant="solid"
                        className="inline-flex h-9 px-4 items-center justify-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs shadow-xs transition-all active:scale-95 shrink-0"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
