import { useState, useMemo } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileCheck,
  Search,
  ChevronRight,
  ChevronLeft,
  Send,
  RefreshCw,
  FileText,
  PlusCircle,
} from "lucide-react";
import Link from "@/lib/next-compat/link";
import { ModernSelect } from "@/components/ui/modern-select";

type Request = {
  id: string;
  requestNumber: string;
  status: string;
  submittedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  rejectionReason: string | null;
  revisionNote: string | null;
  serviceName: string | null;
  serviceItemName: string | null;
};

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string; icon: React.ReactNode }
> = {
  draft: {
    label: "Draft",
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-100 dark:bg-slate-800",
    icon: <FileText className="h-3 w-3" />,
  },
  submitted: {
    label: "Diajukan",
    color: "text-blue-700 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/50",
    icon: <Send className="h-3 w-3" />,
  },
  under_review: {
    label: "Sedang Ditinjau",
    color: "text-amber-700 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/50",
    icon: <Clock className="h-3 w-3" />,
  },
  revision_required: {
    label: "Perlu Revisi",
    color: "text-orange-700 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/50",
    icon: <RefreshCw className="h-3 w-3" />,
  },
  rejected: {
    label: "Ditolak",
    color: "text-rose-700 dark:text-rose-400",
    bgColor: "bg-rose-50 dark:bg-rose-950/50",
    icon: <XCircle className="h-3 w-3" />,
  },
  approved: {
    label: "Disetujui",
    color: "text-emerald-700 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/50",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  completed: {
    label: "Selesai",
    color: "text-teal-700 dark:text-teal-400",
    bgColor: "bg-teal-50 dark:bg-teal-950/50",
    icon: <FileCheck className="h-3 w-3" />,
  },
  spam: {
    label: "Spam",
    color: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/50",
    icon: <AlertCircle className="h-3 w-3" />,
  },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-100 dark:bg-slate-800",
    icon: null,
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${cfg.bgColor} ${cfg.color}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

const PAGE_SIZE = 10;

export function RiwayatTable({ requests }: { requests: Request[] }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const matchSearch =
        search === "" ||
        r.requestNumber.toLowerCase().includes(search.toLowerCase()) ||
        (r.serviceName ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (r.serviceItemName ?? "").toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "all" || r.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [requests, search, filterStatus]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val: string) => {
    setFilterStatus(val);
    setCurrentPage(1);
  };

  const startIndex = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(currentPage * PAGE_SIZE, filtered.length);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Toolbar Pencarian & Filter */}
      <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-2.5 sm:gap-3 bg-slate-50/50 dark:bg-slate-950/30">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nomor pengajuan atau nama layanan..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 transition-colors"
          />
        </div>
        <div className="sm:w-52 shrink-0">
          <ModernSelect
            value={filterStatus}
            onChange={handleStatusChange}
            options={[
              { value: "all", label: "Semua Status (All)" },
              ...Object.entries(STATUS_CONFIG).map(([key, cfg]) => ({
                value: key,
                label: cfg.label,
              })),
            ]}
            placeholder="Semua Status (All)"
            triggerClassName="rounded-lg py-2 h-auto text-xs sm:text-sm font-semibold border-slate-300 dark:border-slate-700"
          />
        </div>
      </div>

      {/* Summary Sub-Bar */}
      <div className="px-3.5 py-2 sm:px-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-900/40 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
        <span>Total: {requests.length} berkas</span>
        <span className="text-slate-600 dark:text-slate-300">
          {filtered.length} ditemukan
        </span>
      </div>

      {/* Content List / Empty State */}
      {filtered.length === 0 ? (
        <div className="py-12 sm:py-16 flex flex-col items-center justify-center text-center gap-2 px-4">
          <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
            <FileText className="h-5 w-5" />
          </div>
          <p className="text-slate-800 dark:text-slate-200 font-bold text-sm">
            Tidak Ada Pengajuan Ditemukan
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-xs max-w-sm font-medium leading-normal">
            {search || filterStatus !== "all"
              ? "Coba ubah kata kunci pencarian atau filter status pengajuan."
              : "Belum ada berkas permohonan layanan yang pernah Anda ajukan."}
          </p>
          <Link
            href="/pegawai/layanan/ajukan"
            className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-colors"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Mulai Ajukan Layanan</span>
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {paginated.map((req) => (
            <div key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
              <Link
                href={`/pegawai/layanan/riwayat/${req.id}`}
                className="w-full p-3.5 sm:p-4 flex items-center gap-3 text-left"
              >
                {/* Icon */}
                <div className="h-9 w-9 shrink-0 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 flex items-center justify-center">
                  <FileText className="h-4 w-4" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors truncate">
                      {req.serviceItemName ?? req.serviceName ?? "Layanan ASN"}
                    </p>
                    <StatusBadge status={req.status} />
                  </div>
                  <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 flex-wrap font-medium">
                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] sm:text-[11px]">
                      {req.requestNumber}
                    </span>
                    <span>·</span>
                    <span className="truncate max-w-[140px] sm:max-w-none">{req.serviceName ?? "-"}</span>
                    <span>·</span>
                    <span>
                      {format(new Date(req.createdAt), "dd MMM yyyy, HH:mm", { locale: id })}
                    </span>
                  </div>
                </div>

                {/* Chevron */}
                <div className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 shrink-0">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Footer Standar */}
      {filtered.length > 0 && (
        <div className="px-3.5 py-3 sm:px-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            Menampilkan <span className="font-semibold text-slate-700 dark:text-slate-300">{startIndex}</span> -{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{endIndex}</span> dari{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> pengajuan
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Sebelumnya</span>
            </button>

            {/* Page indicator */}
            <div className="px-2.5 py-1 text-slate-600 dark:text-slate-300 font-semibold">
              {currentPage} / {totalPages}
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <span>Berikutnya</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
