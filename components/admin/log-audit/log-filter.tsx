"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Search, Filter, X, Download, Calendar, ListFilter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { exportAuditLogsAction } from "@/app/admin/log-audit/actions";

const ACTION_OPTIONS = [
  { value: "all", label: "Semua Aksi" },
  { value: "LOGIN", label: "Login" },
  { value: "LOGOUT", label: "Logout" },
  { value: "BUAT", label: "Membuat" },
  { value: "UBAH", label: "Mengubah" },
  { value: "HAPUS", label: "Menghapus" },
  { value: "VERIFIKASI", label: "Verifikasi" },
  { value: "TOLAK", label: "Menolak" },
  { value: "SETUJUI", label: "Menyetujui" },
  { value: "STATUS", label: "Status" },
  { value: "PROSES", label: "Memproses" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "AI_CHAT", label: "AI Chat" },
  { value: "pembersihan", label: "Pembersihan Storage" },
];

const ENTITY_TYPE_OPTIONS = [
  { value: "all", label: "Semua Tipe" },
  { value: "service_request", label: "Pengajuan" },
  { value: "service", label: "Layanan" },
  { value: "service_item", label: "Item Layanan" },
  { value: "field", label: "Field Form" },
  { value: "requirement", label: "Persyaratan" },
  { value: "guest_book", label: "Buku Tamu" },
  { value: "appointments", label: "Janji Temu" },
  { value: "feedbacks", label: "Saran & Pengaduan" },
  { value: "surat_masuk", label: "Surat Masuk" },
  { value: "surat_keluar", label: "Surat Keluar" },
  { value: "user", label: "Pengguna" },
  { value: "pengajuan_cuti", label: "Cuti" },
  { value: "activity_log", label: "Aktivitas Log" },
  { value: "system", label: "Sistem" },
  { value: "auth", label: "Autentikasi" },
];

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export function LogAuditFilter({ initialQ, initialAction }: { initialQ: string; initialAction: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(initialQ);
  const [action, setAction] = useState(initialAction);
  const [from, setFrom] = useState(searchParams.get("from") || "");
  const [to, setTo] = useState(searchParams.get("to") || "");
  const [entityType, setEntityType] = useState(searchParams.get("entityType") || "all");
  const [pageSize, setPageSize] = useState(searchParams.get("pageSize") || "50");
  const [exporting, setExporting] = useState(false);
  const debouncedQ = useDebounce(q, 500);

  const buildParams = useCallback((overrides: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, val] of Object.entries(overrides)) {
      if (val && val !== "all") params.set(key, val);
      else params.delete(key);
    }
    params.set("page", "1");
    return params;
  }, [searchParams]);

  useEffect(() => {
    if (debouncedQ !== initialQ) {
      router.push(`?${buildParams({ q: debouncedQ })}`);
    }
  }, [debouncedQ]);

  const handleFilterChange = (key: string, val: string) => {
    router.push(`?${buildParams({ [key]: val })}`);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams(searchParams.toString());
      const result = await exportAuditLogsAction({
        q: params.get("q") || undefined,
        action: params.get("action") || undefined,
        from: params.get("from") || undefined,
        to: params.get("to") || undefined,
        entityType: params.get("entityType") || undefined,
      });
      if (result.success && result.csv) {
        const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.filename;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      // silent
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        {/* Search */}
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#059669] transition-colors" />
          <Input
            placeholder="Cari nama petugas, email, aksi, atau objek..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-10 h-11 bg-slate-50/50 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-emerald-500/20 font-medium text-sm transition-all"
          />
          {q && (
            <button 
              onClick={() => { setQ(""); router.push(`?${buildParams({ q: "" })}`); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 text-slate-400 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Action Filter */}
        <div className="relative w-full md:w-44 group">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#059669] transition-colors pointer-events-none" />
          <select
            value={action || "all"}
            onChange={(e) => { setAction(e.target.value); handleFilterChange("action", e.target.value); }}
            className="w-full pl-10 pr-4 h-11 bg-slate-50/50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500/20 font-bold text-[11px] uppercase tracking-wider text-slate-600 cursor-pointer appearance-none outline-none transition-all"
          >
            {ACTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Entity Type Filter */}
        <div className="relative w-full md:w-44 group">
          <ListFilter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#059669] transition-colors pointer-events-none" />
          <select
            value={entityType}
            onChange={(e) => { setEntityType(e.target.value); handleFilterChange("entityType", e.target.value); }}
            className="w-full pl-10 pr-4 h-11 bg-slate-50/50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500/20 font-bold text-[11px] uppercase tracking-wider text-slate-600 cursor-pointer appearance-none outline-none transition-all"
          >
            {ENTITY_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Page Size */}
        <select
          value={pageSize}
          onChange={(e) => { setPageSize(e.target.value); handleFilterChange("pageSize", e.target.value); }}
          className="w-24 h-11 bg-slate-50/50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500/20 font-bold text-[11px] uppercase tracking-wider text-slate-600 cursor-pointer appearance-none outline-none transition-all text-center"
        >
          {PAGE_SIZE_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Export */}
        <Button
          variant="outline"
          size="sm"
          disabled={exporting}
          onClick={handleExport}
          className="h-11 px-4 border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 rounded-xl font-bold text-[11px] uppercase tracking-wider whitespace-nowrap"
        >
          <Download className="h-4 w-4 mr-2" />
          {exporting ? "Mengexport..." : "Export CSV"}
        </Button>
      </div>

      {/* Date Range */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Dari:</span>
          <Input
            type="date"
            value={from}
            onChange={(e) => { setFrom(e.target.value); handleFilterChange("from", e.target.value); }}
            className="h-9 w-44 bg-slate-50/50 border-none rounded-lg text-xs font-medium"
          />
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Sampai:</span>
          <Input
            type="date"
            value={to}
            onChange={(e) => { setTo(e.target.value); handleFilterChange("to", e.target.value); }}
            className="h-9 w-44 bg-slate-50/50 border-none rounded-lg text-xs font-medium"
          />
        </div>
        {(from || to) && (
          <button
            onClick={() => { setFrom(""); setTo(""); router.push(`?${buildParams({ from: "", to: "" })}`); }}
            className="text-[11px] font-bold text-red-500 hover:text-red-700 uppercase tracking-wider"
          >
            Reset Tanggal
          </button>
        )}
      </div>
    </div>
  );
}
