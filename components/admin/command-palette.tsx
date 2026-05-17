"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  FileText,
  User,
  LayoutDashboard,
  Command as CommandIcon,
  Loader2,
  X,
  FolderKanban,
  FileOutput,
  Users,
  History,
  Database,
  Inbox,
  Send,
  ShieldCheck,
  Clock,
  ArrowRight,
  Sparkles,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Full list of admin navigation items for quick access
const QUICK_MENU = [
  { icon: LayoutDashboard, label: "Ringkasan", href: "/admin", desc: "Dashboard utama admin" },
  { icon: FolderKanban, label: "Daftar Pengajuan", href: "/admin/pengajuan", desc: "Kelola pengajuan masuk" },
  { icon: FileOutput, label: "Dokumen Hasil", href: "/admin/dokumen-hasil", desc: "Unduh dokumen yang diterbitkan" },
  { icon: FileText, label: "Master Layanan", href: "/admin/layanan", desc: "Atur layanan & persyaratan" },
  { icon: Inbox, label: "Surat Masuk", href: "/admin/persuratan/surat-masuk", desc: "Arsip surat masuk" },
  { icon: Send, label: "Surat Keluar", href: "/admin/persuratan/surat-keluar", desc: "Arsip surat keluar" },
  { icon: Users, label: "Kelola Pengguna", href: "/admin/pengguna", desc: "Manajemen pengguna & peran" },
  { icon: History, label: "Log Audit", href: "/admin/log-audit", desc: "Riwayat aktivitas sistem" },
  { icon: Database, label: "Pemeliharaan Storage", href: "/admin/pemeliharaan-storage", desc: "Bersihkan penyimpanan R2" },
];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  submitted: { label: "Diajukan", color: "bg-blue-100 text-blue-700" },
  under_review: { label: "Sedang Ditinjau", color: "bg-amber-100 text-amber-700" },
  approved: { label: "Disetujui", color: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "Ditolak", color: "bg-red-100 text-red-700" },
  revision: { label: "Revisi", color: "bg-orange-100 text-orange-700" },
  completed: { label: "Selesai", color: "bg-teal-100 text-teal-700" },
};

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Always use Ctrl+K for Windows
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && e.ctrlKey) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Search API debounced
  React.useEffect(() => {
    if (!query || query.length < 2) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
        setSelectedIndex(0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Reset on open
  React.useEffect(() => {
    if (open) {
      setQuery("");
      setResults(null);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Filter quick menu items based on query
  const filteredQuickMenu = React.useMemo(() => {
    if (!query) return QUICK_MENU;
    const q = query.toLowerCase();
    return QUICK_MENU.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q)
    );
  }, [query]);

  // Build flat navigable items list for keyboard navigation
  const allItems = React.useMemo(() => {
    const items: { type: string; href: string; data?: any }[] = [];

    if (!results) {
      // Show quick menu
      filteredQuickMenu.forEach((m) =>
        items.push({ type: "menu", href: m.href, data: m })
      );
    } else {
      results.requests?.forEach((r: any) =>
        items.push({ type: "request", href: `/admin/pengajuan/${r.id}`, data: r })
      );
      results.profiles?.forEach((p: any) =>
        items.push({ type: "profile", href: `/admin/pengguna?q=${p.email}`, data: p })
      );
      results.services?.forEach((s: any) =>
        items.push({ type: "service", href: `/admin/layanan/${s.id}`, data: s })
      );
      results.auditLogs?.forEach((a: any) =>
        items.push({ type: "audit", href: `/admin/log-audit?q=${a.action}`, data: a })
      );
    }
    return items;
  }, [results, filteredQuickMenu]);

  // Keyboard navigation
  React.useEffect(() => {
    if (!open) return;
    const down = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, allItems.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && allItems[selectedIndex]) {
        e.preventDefault();
        handleSelect(allItems[selectedIndex].href);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, selectedIndex, allItems]);

  // Auto-scroll selected item into view
  React.useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedIndex]);

  const handleSelect = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  const totalResults = results
    ? (results.requests?.length || 0) +
      (results.profiles?.length || 0) +
      (results.services?.length || 0) +
      (results.auditLogs?.length || 0)
    : 0;

  let runningIndex = -1;

  return (
    <>
      {/* Trigger Button — Windows style */}
      <button
        onClick={() => setOpen(true)}
        className="hidden lg:flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-slate-100/80 text-slate-400 hover:text-slate-600 hover:bg-slate-200/80 transition-all duration-200 border border-transparent hover:border-slate-200 group"
      >
        <Search className="h-4 w-4" />
        <span className="text-xs font-bold">Cari...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded-lg border bg-white px-1.5 font-mono text-[10px] font-black opacity-80 shadow-sm">
          Ctrl K
        </kbd>
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -16 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-[680px] overflow-hidden rounded-2xl bg-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.25)] border border-slate-200/80"
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 border-b px-5 py-4">
                <Search className="h-5 w-5 text-slate-400 shrink-0" />
                <input
                  ref={inputRef}
                  autoFocus
                  placeholder="Cari pengajuan, nama pemohon, layanan, atau fitur..."
                  className="flex-1 bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-500 shrink-0" />
                ) : query ? (
                  <button
                    onClick={() => setQuery("")}
                    className="text-slate-300 hover:text-slate-500 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>

              {/* Content Area */}
              <div ref={listRef} className="max-h-[55vh] overflow-y-auto p-3 custom-scrollbar">
                {/* Quick Menu (shown when no query OR query matches menu) */}
                {!results && filteredQuickMenu.length > 0 && (
                  <div className="space-y-1.5">
                    <SectionLabel icon={Sparkles} label="Menu Cepat" count={filteredQuickMenu.length} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {filteredQuickMenu.map((item, i) => {
                        runningIndex++;
                        const idx = runningIndex;
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.href}
                            data-index={idx}
                            onClick={() => handleSelect(item.href)}
                            onMouseEnter={() => setSelectedIndex(idx)}
                            className={cn(
                              "flex items-center gap-3 w-full p-3 rounded-xl text-left transition-all duration-150",
                              selectedIndex === idx
                                ? "bg-emerald-50 ring-1 ring-emerald-200"
                                : "hover:bg-slate-50"
                            )}
                          >
                            <div
                              className={cn(
                                "h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                                selectedIndex === idx
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-slate-100 text-slate-400"
                              )}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <p
                                className={cn(
                                  "text-xs font-bold truncate transition-colors",
                                  selectedIndex === idx ? "text-emerald-800" : "text-slate-700"
                                )}
                              >
                                {item.label}
                              </p>
                              <p className="text-[10px] font-medium text-slate-400 truncate">
                                {item.desc}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Search Results */}
                {results && (
                  <div className="space-y-4">
                    {/* Requests */}
                    {results.requests?.length > 0 && (
                      <div className="space-y-1">
                        <SectionLabel icon={FolderKanban} label="Pengajuan" count={results.requests.length} />
                        {results.requests.map((r: any) => {
                          runningIndex++;
                          const idx = runningIndex;
                          const statusCfg = STATUS_CONFIG[r.status] || { label: r.status, color: "bg-slate-100 text-slate-600" };
                          return (
                            <ResultRow
                              key={r.id}
                              dataIndex={idx}
                              isSelected={selectedIndex === idx}
                              onClick={() => handleSelect(`/admin/pengajuan/${r.id}`)}
                              onMouseEnter={() => setSelectedIndex(idx)}
                              icon={
                                <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-[11px] shrink-0">
                                  {r.requestNumber?.slice(-3)}
                                </div>
                              }
                              title={r.requestNumber}
                              subtitle={
                                <span className="flex items-center gap-1.5 flex-wrap">
                                  <span>{r.serviceName || "—"}</span>
                                  <span className="text-slate-300">•</span>
                                  <span>{r.applicantName || "Anonim"}</span>
                                </span>
                              }
                              badge={
                                <span className={cn("px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider", statusCfg.color)}>
                                  {statusCfg.label}
                                </span>
                              }
                            />
                          );
                        })}
                      </div>
                    )}

                    {/* Profiles */}
                    {results.profiles?.length > 0 && (
                      <div className="space-y-1">
                        <SectionLabel icon={Users} label="Pengguna" count={results.profiles.length} />
                        {results.profiles.map((p: any) => {
                          runningIndex++;
                          const idx = runningIndex;
                          const roleCfg =
                            p.role === "super_admin"
                              ? { label: "Super Admin", color: "bg-purple-100 text-purple-700" }
                              : p.role === "admin"
                                ? { label: "Admin", color: "bg-amber-100 text-amber-700" }
                                : { label: "Pemohon", color: "bg-blue-100 text-blue-700" };
                          return (
                            <ResultRow
                              key={p.id}
                              dataIndex={idx}
                              isSelected={selectedIndex === idx}
                              onClick={() => handleSelect(`/admin/pengguna?q=${p.email}`)}
                              onMouseEnter={() => setSelectedIndex(idx)}
                              icon={
                                <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                                  <User className="h-5 w-5" />
                                </div>
                              }
                              title={p.fullName || "Tanpa Nama"}
                              subtitle={
                                <span className="flex items-center gap-1.5">
                                  <span>{p.email}</span>
                                  {p.phone && (
                                    <>
                                      <span className="text-slate-300">•</span>
                                      <span>{p.phone}</span>
                                    </>
                                  )}
                                </span>
                              }
                              badge={
                                <span className={cn("px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider", roleCfg.color)}>
                                  {roleCfg.label}
                                </span>
                              }
                            />
                          );
                        })}
                      </div>
                    )}

                    {/* Services */}
                    {results.services?.length > 0 && (
                      <div className="space-y-1">
                        <SectionLabel icon={Layers} label="Layanan" count={results.services.length} />
                        {results.services.map((s: any) => {
                          runningIndex++;
                          const idx = runningIndex;
                          return (
                            <ResultRow
                              key={s.id}
                              dataIndex={idx}
                              isSelected={selectedIndex === idx}
                              onClick={() => handleSelect(`/admin/layanan/${s.id}`)}
                              onMouseEnter={() => setSelectedIndex(idx)}
                              icon={
                                <div className="h-10 w-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-700 shrink-0">
                                  <FileText className="h-5 w-5" />
                                </div>
                              }
                              title={s.name}
                              subtitle={<span className="font-mono text-[10px]">/{s.slug}</span>}
                            />
                          );
                        })}
                      </div>
                    )}

                    {/* Audit Logs */}
                    {results.auditLogs?.length > 0 && (
                      <div className="space-y-1">
                        <SectionLabel icon={ShieldCheck} label="Log Audit" count={results.auditLogs.length} />
                        {results.auditLogs.map((a: any) => {
                          runningIndex++;
                          const idx = runningIndex;
                          return (
                            <ResultRow
                              key={a.id}
                              dataIndex={idx}
                              isSelected={selectedIndex === idx}
                              onClick={() => handleSelect(`/admin/log-audit`)}
                              onMouseEnter={() => setSelectedIndex(idx)}
                              icon={
                                <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                                  <History className="h-5 w-5" />
                                </div>
                              }
                              title={`${a.action} → ${a.entityType || ""}`}
                              subtitle={
                                <span className="flex items-center gap-1.5">
                                  <span>{a.adminName || "System"}</span>
                                  {a.createdAt && (
                                    <>
                                      <span className="text-slate-300">•</span>
                                      <Clock className="h-3 w-3 inline" />
                                      <span>{new Date(a.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</span>
                                    </>
                                  )}
                                </span>
                              }
                            />
                          );
                        })}
                      </div>
                    )}

                    {/* Empty State */}
                    {totalResults === 0 && !loading && (
                      <div className="py-16 text-center text-slate-400">
                        <Search className="h-12 w-12 mx-auto opacity-10 mb-4" />
                        <p className="text-sm font-bold">Tidak ada hasil untuk &quot;{query}&quot;</p>
                        <p className="text-xs font-medium text-slate-400 mt-1.5">
                          Coba kata kunci lain, nomor pengajuan, atau nama pemohon
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer — Windows shortcuts only */}
              <div className="border-t px-5 py-3 bg-slate-50/80 flex items-center justify-between">
                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <kbd className="bg-white border rounded-md px-1.5 py-0.5 text-[9px] font-mono shadow-sm">↑</kbd>
                    <kbd className="bg-white border rounded-md px-1.5 py-0.5 text-[9px] font-mono shadow-sm">↓</kbd>
                    <span className="uppercase tracking-wider">Navigasi</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <kbd className="bg-white border rounded-md px-1.5 py-0.5 text-[9px] font-mono shadow-sm">Enter</kbd>
                    <span className="uppercase tracking-wider">Pilih</span>
                  </span>
                </div>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                  <kbd className="bg-white border rounded-md px-1.5 py-0.5 text-[9px] font-mono shadow-sm">Esc</kbd>
                  <span className="uppercase tracking-wider">Tutup</span>
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// --- Sub-components ---

function SectionLabel({ icon: Icon, label, count }: { icon: React.ElementType; label: string; count: number }) {
  return (
    <div className="flex items-center justify-between px-2 py-2">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <span className="text-[9px] font-black text-slate-300 bg-slate-100 px-2 py-0.5 rounded-full">{count}</span>
    </div>
  );
}

function ResultRow({
  dataIndex,
  isSelected,
  onClick,
  onMouseEnter,
  icon,
  title,
  subtitle,
  badge,
}: {
  dataIndex: number;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <div
      data-index={dataIndex}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-150 group",
        isSelected
          ? "bg-emerald-50 ring-1 ring-emerald-200"
          : "hover:bg-slate-50"
      )}
    >
      {icon}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-bold truncate transition-colors",
            isSelected ? "text-emerald-800" : "text-slate-900 group-hover:text-emerald-700"
          )}
        >
          {title}
        </p>
        <p className="text-[10px] font-semibold text-slate-400 truncate">{subtitle}</p>
      </div>
      {badge}
      <ArrowRight
        className={cn(
          "h-4 w-4 shrink-0 transition-all duration-150",
          isSelected ? "text-emerald-500 translate-x-0 opacity-100" : "text-slate-200 -translate-x-1 opacity-0"
        )}
      />
    </div>
  );
}
