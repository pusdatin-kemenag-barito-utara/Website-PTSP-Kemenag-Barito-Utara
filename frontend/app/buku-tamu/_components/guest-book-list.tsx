"use client";

import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { GuestEntry } from "./types";
import { formatDate, maskPhoneNumber, formatDateHeading } from "./utils";
import { ModernSelect } from "@/components/ui/modern-select";

const MaskedPhone = ({ phone }: { phone: string }) => {
  return (
    <span
      className="font-medium text-left cursor-default select-none"
      title="Nomor disembunyikan untuk menjaga privasi"
    >
      {maskPhoneNumber(phone)}
    </span>
  );
};

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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const itemsPerPage = 5;

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
    <div className="w-full">
      {/* Breadcrumb */}
      <div className="mb-6 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-400">
        <button
          onClick={() => onSwitchTab("form")}
          className="hover:text-emerald-600 transition-colors"
        >
          Buku Tamu
        </button>
        <span className="text-slate-300">/</span>
        <button
          onClick={() => onSwitchTab("list")}
          className="text-emerald-600 font-bold"
        >
          Daftar Tamu
        </button>
        <span className="text-slate-300">/</span>
        <button
          onClick={() => onSwitchTab("stats")}
          className="hover:text-emerald-600 transition-colors flex items-center gap-1"
        >
          Statistik Tamu 📊
        </button>
      </div>

      {/* Header & Actions */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
            Daftar Kunjungan Tamu
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Berikut adalah riwayat kunjungan tamu di Kantor Kemenag Barito
            Utara.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full max-w-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
          </div>
          <input
            type="text"
            placeholder="Cari nama, instansi, atau keperluan..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 py-2.5 pl-10 pr-4 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Sort Dropdown */}
        <div className="w-full sm:w-56">
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

      {/* Date Heading Banner */}
      <div className="mb-4 text-center md:text-left">
        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/60 px-4 py-2.5 rounded-xl border border-emerald-100/50 dark:border-emerald-900/50 inline-block">
          Daftar Tamu Tanggal {formatDateHeading(statsDate)}
        </h3>
      </div>

      {/* Empty State */}
      {filteredEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            Tidak Ada Data Kunjungan
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {searchQuery
              ? "Tidak ada hasil pencarian yang cocok."
              : "Belum ada tamu yang terdaftar hari ini."}
          </p>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="mt-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700"
            >
              Reset Pencarian
            </button>
          )}
        </div>
      ) : (
        <>
          {/* DESKTOP VIEW: Table */}
          <div className="hidden overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 md:block transition-colors duration-300">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="px-6 py-4">Tamu / WhatsApp</th>
                  <th className="px-6 py-4">Instansi</th>
                  <th className="px-6 py-4">Tujuan / Pejabat</th>
                  <th className="px-6 py-4">Keperluan</th>
                  <th className="px-6 py-4 text-right">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm text-slate-700 dark:text-slate-300">
                {currentEntries.map((entry: any) => {
                  const guestName = entry.guestName || entry.guest_name || entry.nama || "-";
                  const whatsapp = entry.whatsapp || entry.no_hp || entry.phone || "";
                  const instType = entry.institutionType || entry.institution_type || "-";
                  const instName = entry.institutionName || entry.institution_name || "";
                  const intendedOfficer = entry.intendedOfficer || entry.intended_officer || "-";
                  const purpose = entry.purpose || entry.keperluan || "-";
                  const visitDate = entry.visitDate || entry.visit_date || entry.created_at || "";

                  return (
                    <tr
                      key={entry.id}
                      className="hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-colors"
                    >
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">
                        <div>{guestName}</div>
                        <div className="text-xs text-emerald-600 dark:text-emerald-400 font-normal">
                          {whatsapp && whatsapp !== "-" ? (
                            <MaskedPhone phone={whatsapp} />
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {instName || "-"}
                        </div>
                        <div className="text-xs text-slate-400 dark:text-slate-500">
                          {instType}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                        {intendedOfficer}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                        {purpose}
                      </td>
                      <td className="px-6 py-4 text-right text-xs text-slate-400 dark:text-slate-500 font-medium">
                        {formatDate(visitDate)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* MOBILE VIEW: Simplified List */}
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

              return (
                <div
                  key={entry.id}
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                  className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-sm transition-all hover:shadow-md cursor-pointer active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between p-4">
                    <div className="flex-1 min-w-0 pr-4">
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">
                        {guestName}
                      </h4>
                      <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <span className="font-medium">Tujuan:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                          {intendedOfficer}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                      <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/20">
                        {instType}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">
                          {formatDate(visitDate).includes(",")
                            ? formatDate(visitDate).split(",")[0]
                            : formatDate(visitDate)}
                        </span>
                        <ChevronDown
                          className={`h-3.5 w-3.5 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="p-4 pt-1 border-t border-slate-100/60 mt-1 space-y-3 bg-slate-50/50">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                            Instansi
                          </p>
                          <p className="text-xs font-semibold text-slate-800 mt-0.5">
                            {instName}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                            WhatsApp
                          </p>
                          <p className="text-xs font-semibold text-emerald-600 mt-0.5">
                            {whatsapp && whatsapp !== "-" ? (
                              <MaskedPhone phone={whatsapp} />
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                          Keperluan
                        </p>
                        <p className="text-[11.5px] font-medium text-slate-600 mt-0.5 leading-relaxed">
                          {purpose}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 border-t border-slate-100 pt-5">
              <div className="flex items-center justify-between w-full sm:w-auto gap-2 order-2 sm:order-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 border border-slate-200 bg-white shadow-sm hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Sebelumnya</span>
                </button>

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 border border-slate-200 bg-white shadow-sm hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <span>Selanjutnya</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-1 order-1 sm:order-2">
                <span className="text-xs font-semibold text-slate-500">
                  Halaman <span className="text-slate-900">{currentPage}</span>{" "}
                  dari <span className="text-slate-900">{totalPages}</span>
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
