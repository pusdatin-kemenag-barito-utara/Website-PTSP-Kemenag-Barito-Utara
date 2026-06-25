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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nomor pengajuan atau layanan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="sm:w-48 px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-white"
        >
          <option value="all">Semua Status</option>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.label}</option>
          ))}
        </select>
      </div>

      {/* Summary counts */}
      <div className="px-5 py-3 border-b border-slate-50 flex gap-4 text-xs text-slate-500 font-medium">
        <span>{requests.length} total pengajuan</span>
        <span>·</span>
        <span>{filtered.length} ditampilkan</span>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center gap-3">
          <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center">
            <ScrollText className="h-8 w-8 text-slate-300" />
          </div>
          <p className="text-slate-500 font-medium">Tidak ada pengajuan ditemukan</p>
          <p className="text-slate-400 text-sm max-w-xs">
            {search || filterStatus !== "all"
              ? "Coba ubah filter atau kata kunci pencarian."
              : "Belum ada layanan yang pernah Anda ajukan."}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50">
          {filtered.map((req) => (
              <div key={req.id} className="hover:bg-slate-50/60 transition-colors">
                <Link
                  href={`/pegawai/layanan/riwayat/${req.id}`}
                  className="w-full px-5 py-4 flex items-center gap-4 text-left"
                >
                  {/* Icon */}
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-emerald-600" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {req.serviceItemName ?? req.serviceName ?? "Layanan"}
                      </p>
                      <StatusBadge status={req.status} />
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 flex-wrap">
                      <span className="font-mono">{req.requestNumber}</span>
                      <span>·</span>
                      <span>{req.serviceName ?? "-"}</span>
                      <span>·</span>
                      <span>
                        {format(new Date(req.createdAt), "dd MMM yyyy, HH:mm", { locale: id })}
                      </span>
                    </div>
                  </div>

                  {/* Chevron */}
                  <ChevronRight
                    className="h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0"
                  />
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
