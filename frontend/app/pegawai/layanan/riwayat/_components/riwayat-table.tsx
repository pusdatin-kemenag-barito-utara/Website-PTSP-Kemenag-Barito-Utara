"use client";

import { useState } from "react";
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
  Send,
  RefreshCw,
  FileText,
} from "lucide-react";
import Link from "next/link";

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
    color: "text-slate-600",
    bgColor: "bg-slate-100",
    icon: <FileText className="h-3.5 w-3.5" />,
  },
  submitted: {
    label: "Diajukan",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    icon: <Send className="h-3.5 w-3.5" />,
  },
  under_review: {
    label: "Sedang Ditinjau",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  revision_required: {
    label: "Perlu Revisi",
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    icon: <RefreshCw className="h-3.5 w-3.5" />,
  },
  rejected: {
    label: "Ditolak",
    color: "text-rose-700",
    bgColor: "bg-rose-50",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
  approved: {
    label: "Disetujui",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  completed: {
    label: "Selesai",
    color: "text-teal-700",
    bgColor: "bg-teal-50",
    icon: <FileCheck className="h-3.5 w-3.5" />,
  },
  spam: {
    label: "Spam",
    color: "text-red-700",
    bgColor: "bg-red-50",
    icon: <AlertCircle className="h-3.5 w-3.5" />,
  },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    color: "text-slate-600",
    bgColor: "bg-slate-100",
    icon: null,
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${cfg.bgColor} ${cfg.color}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

export function RiwayatTable({ requests }: { requests: Request[] }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = requests.filter((r) => {
    const matchSearch =
      search === "" ||
      r.requestNumber.toLowerCase().includes(search.toLowerCase()) ||
      (r.serviceName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (r.serviceItemName ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
      {/* Toolbar Pencarian & Filter */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row gap-3 bg-slate-50/50 dark:bg-slate-950/40">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nomor pengajuan atau nama layanan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-xs"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="sm:w-52 px-4 py-2.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm font-extrabold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer shadow-xs"
        >
          <option value="all">Semua Status (All)</option>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key}>
              {cfg.label}
            </option>
          ))}
        </select>
      </div>

      {/* Summary counts */}
      <div className="px-5 py-2.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/20 dark:bg-slate-900 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-bold">
        <span>Total: {requests.length} Berkas</span>
        <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold text-slate-600 dark:text-slate-300">
          {filtered.length} Ditemukan
        </span>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="py-16 sm:py-20 flex flex-col items-center justify-center text-center gap-3 px-4">
          <div className="h-16 w-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <ScrollText className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-slate-800 dark:text-slate-200 font-extrabold text-base">Tidak Ada Pengajuan Ditemukan</p>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-xs font-medium leading-relaxed">
            {search || filterStatus !== "all"
              ? "Coba ubah kata kunci pencarian atau filter status pengajuan."
              : "Belum ada berkas layanan yang pernah Anda ajukan."}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {filtered.map((req) => (
            <div key={req.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
              <Link
                href={`/pegawai/layanan/riwayat/${req.id}`}
                className="w-full p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 text-left"
              >
                {/* Icon */}
                <div className="h-11 w-11 shrink-0 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FileText className="h-5.5 w-5.5 text-emerald-600 dark:text-emerald-400" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-xs sm:text-base font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                      {req.serviceItemName ?? req.serviceName ?? "Layanan ASN"}
                    </p>
                    <StatusBadge status={req.status} />
                  </div>
                  <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 flex-wrap font-medium">
                    <span className="font-mono font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-[10px] sm:text-xs">
                      {req.requestNumber}
                    </span>
                    <span>·</span>
                    <span>{req.serviceName ?? "-"}</span>
                    <span>·</span>
                    <span>
                      {format(new Date(req.createdAt), "dd MMM yyyy, HH:mm", { locale: id })}
                    </span>
                  </div>
                </div>

                {/* Chevron */}
                <div className="h-8 w-8 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-emerald-500 group-hover:text-white flex items-center justify-center transition-all shrink-0 group-hover:translate-x-1">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ScrollText({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}
