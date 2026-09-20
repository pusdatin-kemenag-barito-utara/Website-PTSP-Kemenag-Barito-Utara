import { useState } from "react";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  X, 
  CalendarDays, 
  Phone, 
  Building2, 
  Clock,
  User,
  SlidersHorizontal
} from "lucide-react";
import type { GuestEntry } from "./types";
import { formatDate, maskPhoneNumber, formatDateHeading } from "./utils";
import { ModernSelect } from "@/components/ui/modern-select";

const MaskedPhone = ({ phone }: { phone: string }) => {
  return (
    <span
      className="font-medium text-left cursor-default select-none font-mono text-[11px] tracking-wider"
      title="Nomor disembunyikan untuk menjaga privasi"
    >
      {maskPhoneNumber(phone)}
    </span>
  );
};

function getInstTypeBadge(instType: string) {
  const lower = (instType || "").toLowerCase();
  if (lower.includes("pemerintah")) {
    return "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200/80 dark:border-sky-800/80";
  }
  if (lower.includes("swasta")) {
    return "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/80";
  }
  if (lower.includes("pribadi") || lower.includes("perorangan")) {
    return "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/80";
  }
  return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700";
}

function getPaginationPages(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", total];
  }
  if (current >= total - 3) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, "...", current - 1, current, current + 1, "...", total];
}

function getMobilePaginationPages(current: number, total: number): (number | "...")[] {
  if (total <= 4) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 2) {
    return [1, 2, "...", total];
  }
  if (current >= total - 1) {
    return [1, "...", total - 1, total];
  }
  return [1, "...", current, "...", total];
}

interface GuestBookListProps {
  entries: GuestEntry[];
  statsDate: string;
  onSwitchTab: (tab: "form" | "list" | "stats") => void;
}

export default function GuestBookList({
  entries,
  statsDate,
  onSwitchTab,
}: GuestBookListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredEntries = entries
    .filter((entry) => {
      const query = searchQuery.toLowerCase();
      const name =
        entry.guestName ||
        (entry as any).guest_name ||
        (entry as any).nama ||
        "";
      const phone =
        entry.whatsapp || (entry as any).no_hp || (entry as any).phone || "";
      const instName =
        entry.institutionName || (entry as any).institution_name || "";
      const instType =
        entry.institutionType || (entry as any).institution_type || "";
      const officer =
        entry.intendedOfficer || (entry as any).intended_officer || "";
      const purpose = entry.purpose || (entry as any).keperluan || "";

      return (
        name.toLowerCase().includes(query) ||
        phone.includes(query) ||
        instName.toLowerCase().includes(query) ||
        instType.toLowerCase().includes(query) ||
        officer.toLowerCase().includes(query) ||
        purpose.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      const dateA = new Date(
        a.visitDate || (a as any).visit_date || (a as any).created_at || 0
      ).getTime();
      const dateB = new Date(
        b.visitDate || (b as any).visit_date || (b as any).created_at || 0
      ).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage) || 1;
  const currentEntries = filteredEntries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="w-full space-y-6">
      {/* ── Breadcrumb Sub-Nav ── */}
      <nav aria-label="Buku Tamu Navigation" className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500">
        <button
          type="button"
          onClick={() => onSwitchTab("form")}
          className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
        >
          Buku Tamu
        </button>
        <span className="text-slate-300 dark:text-slate-700">/</span>
        <button
          type="button"
          onClick={() => onSwitchTab("list")}
          className="text-emerald-600 dark:text-emerald-400 font-bold cursor-pointer"
        >
          Daftar Tamu
        </button>
        <span className="text-slate-300 dark:text-slate-700">/</span>
        <button
          type="button"
          onClick={() => onSwitchTab("stats")}
          className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span>Statistik Tamu</span>
          <span>📊</span>
        </button>
      </nav>

      {/* ── Header & Search Controls ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Daftar Kunjungan Tamu
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Berikut adalah riwayat kunjungan tamu di Kantor Kemenag Barito Utara.
          </p>
        </div>

        {/* Search & Filter Group */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Bar */}
          <div className="relative w-full sm:w-72 md:w-80">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Cari nama, instansi, atau keperluan..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/80 py-2.5 pl-10 pr-9 text-xs sm:text-sm font-medium text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-xs transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="w-full sm:w-48 shrink-0">
            <ModernSelect
              options={[
                { value: "desc", label: "Urutkan: Terbaru" },
                { value: "asc", label: "Urutkan: Terlama" },
              ]}
              value={sortOrder}
              onChange={(val) => setSortOrder(val as "desc" | "asc")}
            />
          </div>
        </div>
      </div>

      {/* ── Status & Date Heading Banner ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200/80 dark:border-emerald-800/80 shadow-xs">
          <CalendarDays className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Daftar Tamu Tanggal {formatDateHeading(statsDate)}</span>
        </div>

        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Total: <span className="font-bold text-slate-900 dark:text-slate-100">{filteredEntries.length}</span> kunjungan
        </div>
      </div>

      {/* ── Empty State ── */}
      {filteredEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
            <User className="h-7 w-7" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">
            Tidak Ada Data Kunjungan
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm">
            {searchQuery
              ? "Tidak ada hasil kunjungan yang cocok dengan pencarian Anda."
              : "Belum ada tamu yang terdaftar pada tanggal ini."}
          </p>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200/80 dark:border-emerald-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
            >
              Reset Pencarian
            </button>
          )}
        </div>
      ) : (
        <>
          {/* ── DESKTOP VIEW: Clean Modern Table ── */}
          <div className="hidden overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/80 md:block shadow-xs transition-colors duration-300">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="px-5 py-3.5">Tamu / WhatsApp</th>
                  <th className="px-5 py-3.5">Instansi</th>
                  <th className="px-5 py-3.5">Tujuan / Pejabat</th>
                  <th className="px-5 py-3.5">Keperluan</th>
                  <th className="px-5 py-3.5 text-right">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                {currentEntries.map((entry: any) => {
                  const guestName = entry.guestName || entry.guest_name || entry.nama || "-";
                  const whatsapp = entry.whatsapp || entry.no_hp || entry.phone || "";
                  const instType = entry.institutionType || entry.institution_type || "";
                  const instName = entry.institutionName || entry.institution_name || "";
                  const intendedOfficer = entry.intendedOfficer || entry.intended_officer || "-";
                  const purpose = entry.purpose || entry.keperluan || "-";
                  const visitDate = entry.visitDate || entry.visit_date || entry.created_at || "";

                  const initial = guestName && guestName !== "-"
                    ? guestName.charAt(0).toUpperCase()
                    : "?";

                  return (
                    <tr
                      key={entry.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* Tamu / WhatsApp */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-black text-xs border border-emerald-200/60 dark:border-emerald-800/60 shadow-2xs">
                            {initial}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white leading-tight">
                              {guestName}
                            </div>
                            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                              {whatsapp && whatsapp !== "-" ? (
                                <>
                                  <Phone className="h-3 w-3 opacity-80" />
                                  <MaskedPhone phone={whatsapp} />
                                </>
                              ) : (
                                <span className="text-slate-400 font-normal">-</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Instansi */}
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {instName && instName !== "-" ? instName : "Perorangan / Pribadi"}
                        </div>
                        {instType && (
                          <div className="mt-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${getInstTypeBadge(instType)}`}>
                              {instType}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Tujuan / Pejabat */}
                      <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-200">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                          <Building2 className="h-3.5 w-3.5 text-slate-400" />
                          <span>{intendedOfficer}</span>
                        </div>
                      </td>

                      {/* Keperluan */}
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400 max-w-xs">
                        <p className="line-clamp-2 leading-relaxed text-xs">
                          {purpose}
                        </p>
                      </td>

                      {/* Waktu */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>{formatDate(visitDate)}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── MOBILE VIEW: Card List ── */}
          <div className="grid gap-3 md:hidden">
            {currentEntries.map((entry: any) => {
              const isExpanded = expandedId === entry.id;
              const guestName = entry.guestName || entry.guest_name || entry.nama || "-";
              const whatsapp = entry.whatsapp || entry.no_hp || entry.phone || "";
              const instType = entry.institutionType || entry.institution_type || "-";
              const instName = entry.institutionName || entry.institution_name || "-";
              const intendedOfficer = entry.intendedOfficer || entry.intended_officer || "-";
              const purpose = entry.purpose || entry.keperluan || "-";
              const visitDate = entry.visitDate || entry.visit_date || entry.created_at || "";

              const initial = guestName && guestName !== "-"
                ? guestName.charAt(0).toUpperCase()
                : "?";

              return (
                <div
                  key={entry.id}
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                  className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between p-4 gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold text-xs border border-emerald-200/60 dark:border-emerald-800/60">
                        {initial}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                          {guestName}
                        </h4>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          Tujuan: <span className="font-semibold text-slate-700 dark:text-slate-300">{intendedOfficer}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold border ${getInstTypeBadge(instType)}`}>
                        {instType}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                        <span>{formatDate(visitDate)}</span>
                        <ChevronDown
                          className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="p-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3 bg-slate-50/60 dark:bg-slate-950/40 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Instansi
                          </p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                            {instName}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            WhatsApp
                          </p>
                          <p className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                            {whatsapp && whatsapp !== "-" ? (
                              <MaskedPhone phone={whatsapp} />
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Keperluan
                        </p>
                        <p className="font-medium text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">
                          {purpose}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── NUMBERED PAGINATION CONTROLS ── */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80 dark:border-slate-800 pt-5">
              {/* Entries Info */}
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 order-2 sm:order-1 text-center sm:text-left">
                Menampilkan{" "}
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{" "}
                -{" "}
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {Math.min(currentPage * itemsPerPage, filteredEntries.length)}
                </span>{" "}
                dari{" "}
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {filteredEntries.length}
                </span>{" "}
                kunjungan
              </div>

              {/* ── MOBILE CONTROLS: Strictly 1 Row, Compact (sm:hidden) ── */}
              <div className="flex sm:hidden items-center justify-center gap-1.5 order-1 w-full flex-nowrap">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  aria-label="Halaman Sebelumnya"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-1 flex-nowrap">
                  {getMobilePaginationPages(currentPage, totalPages).map((item, idx) => {
                    if (item === "...") {
                      return (
                        <span
                          key={`m-ellipsis-${idx}`}
                          className="px-1 text-xs font-bold text-slate-400 select-none shrink-0"
                        >
                          ...
                        </span>
                      );
                    }

                    const pageNum = item as number;
                    const isActive = currentPage === pageNum;

                    return (
                      <button
                        key={`m-page-${pageNum}`}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`h-8.5 min-w-8.5 px-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                          isActive
                            ? "bg-emerald-600 text-white shadow-xs shadow-emerald-600/30"
                            : "text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  aria-label="Halaman Selanjutnya"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* ── DESKTOP CONTROLS: Full Numbered Layout (hidden sm:flex) ── */}
              <div className="hidden sm:flex items-center gap-1.5 order-1 sm:order-2 flex-wrap justify-center">
                {/* Prev Button */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Sebelumnya</span>
                </button>

                {/* Number Buttons */}
                {getPaginationPages(currentPage, totalPages).map((item, idx) => {
                  if (item === "...") {
                    return (
                      <span
                        key={`ellipsis-${idx}`}
                        className="px-1.5 py-1 text-xs font-bold text-slate-400 dark:text-slate-500 select-none"
                      >
                        ...
                      </span>
                    );
                  }

                  const pageNum = item as number;
                  const isActive = currentPage === pageNum;

                  return (
                    <button
                      key={`page-${pageNum}`}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-8.5 min-w-8.5 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? "bg-emerald-600 text-white shadow-xs shadow-emerald-600/30"
                          : "text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {/* Next Button */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <span>Selanjutnya</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
