"use client";

import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { GuestEntry } from "./types";
import { formatDate, maskPhoneNumber, formatDateHeading } from "./utils";

const RevealPhone = ({ phone }: { phone: string }) => {
  const [revealed, setRevealed] = useState(false);
  
  if (revealed) {
    return (
      <button 
        onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${phone}`, "_blank"); }} 
        className="hover:underline font-medium text-left text-emerald-700"
        title="Klik untuk Chat"
      >
        {phone}
      </button>
    );
  }
  return (
    <button 
      onClick={(e) => { e.stopPropagation(); setRevealed(true); }} 
      className="hover:underline font-medium text-left" 
      title="Tampilkan Nomor"
    >
      {maskPhoneNumber(phone)}
    </button>
  );
};

interface GuestBookListProps {
  entries: GuestEntry[];
  statsDate: string;
  onSwitchTab: (tab: "form" | "list" | "stats") => void;
}

export default function GuestBookList({ entries, statsDate, onSwitchTab }: GuestBookListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const itemsPerPage = 5;

  const filteredEntries = entries
    .filter((entry) => {
      const query = searchQuery.toLowerCase();
      return (
        entry.guestName.toLowerCase().includes(query) ||
        entry.whatsapp.includes(query) ||
        (entry.institutionName || "").toLowerCase().includes(query) ||
        entry.institutionType.toLowerCase().includes(query) ||
        entry.intendedOfficer.toLowerCase().includes(query) ||
        entry.purpose.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      const timeA = new Date(a.visitDate).getTime();
      const timeB = new Date(b.visitDate).getTime();
      return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
    });

  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const currentEntries = filteredEntries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-5xl"
    >
      {/* Breadcrumb */}
      <motion.div variants={itemVariants} className="mb-6 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-400">
        <button onClick={() => onSwitchTab("form")} className="hover:text-emerald-600 transition-colors">
          Buku Tamu
        </button>
        <span className="text-slate-300">/</span>
        <button onClick={() => onSwitchTab("list")} className="text-emerald-600 font-bold">
          Daftar Tamu
        </button>
        <span className="text-slate-300">/</span>
        <button onClick={() => onSwitchTab("stats")} className="hover:text-emerald-600 transition-colors flex items-center gap-1">
          Statistik Tamu 📊
        </button>
      </motion.div>

      <motion.div variants={itemVariants} className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">
            Daftar Kunjungan Tamu
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Berikut adalah riwayat kunjungan tamu di Kantor Kemenag Barito Utara.
          </p>
        </div>

        {/* Search Box */}
        <div className="relative w-full max-w-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4.5 w-4.5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Cari nama, instansi, atau keperluan..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl border border-slate-200 bg-white/70 py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        
        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "desc" | "asc")}
            className="appearance-none w-full sm:w-auto rounded-xl border border-slate-200 bg-white/70 py-2.5 pl-4 pr-10 text-sm font-medium text-slate-700 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
          >
            <option value="desc">Urutkan: Terbaru</option>
            <option value="asc">Urutkan: Terlama</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
      </motion.div>

      {/* Date Heading Banner */}
      <motion.div variants={itemVariants} className="mb-4 text-center md:text-left">
        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50/80 px-4 py-2.5 rounded-xl border border-emerald-100/50 inline-block">
          Daftar Tamu Tanggal {formatDateHeading(statsDate)}
        </h3>
      </motion.div>

      {/* Empty State */}
      {filteredEntries.length === 0 ? (
        <motion.div variants={itemVariants} className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-slate-800">
            Tidak Ada Data Kunjungan
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {searchQuery ? "Tidak ada hasil pencarian yang cocok." : "Belum ada tamu yang terdaftar hari ini."}
          </p>
          {searchQuery && (
            <button onClick={() => { setSearchQuery(""); setCurrentPage(1); }} className="mt-4 text-sm font-semibold text-emerald-600 hover:text-emerald-700">
              Reset Pencarian
            </button>
          )}
        </motion.div>
      ) : (
        <>
          {/* DESKTOP VIEW: Table */}
          <motion.div variants={itemVariants} className="hidden overflow-x-auto rounded-2xl border border-slate-100 bg-white/50 md:block">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/70 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Tamu / WhatsApp</th>
                  <th className="px-6 py-4">Instansi</th>
                  <th className="px-6 py-4">Tujuan / Pejabat</th>
                  <th className="px-6 py-4">Keperluan</th>
                  <th className="px-6 py-4 text-right">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {currentEntries.map((entry) => (
                  <tr key={entry.id} className="transition-colors hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{entry.guestName}</div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-emerald-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.978L2 22l5.19-1.354a9.92 9.92 0 0 0 4.82 1.354h.005c5.507 0 9.99-4.478 9.99-9.984A9.99 9.99 0 0 0 12.012 2Zm4.87 14.153c-.27.756-1.38 1.488-1.9 1.554-.51.066-1.02.324-3.23-.58-2.67-1.09-4.38-3.8-4.51-3.98a5.27 5.27 0 0 1-1.12-2.83 3.09 3.09 0 0 1 1-2.31c.14-.14.28-.21.41-.21h.33c.1 0 .23 0 .36.3.13.33.47 1.15.51 1.24a.32.32 0 0 1 .02.3c-.08.16-.18.26-.3.4l-.38.45c-.12.13-.25.27-.1.53.15.25.66 1.09 1.42 1.76.98.87 1.8 1.14 2.06 1.27.26.13.41.11.56-.06.15-.17.66-.76.84-.96.18-.2.36-.16.6-.08l1.52.75c.24.12.4.18.46.28.06.1.06.6-.21 1.35Z" />
                        </svg>
                        {entry.whatsapp && entry.whatsapp !== "-" ? (
                          <RevealPhone phone={entry.whatsapp} />
                        ) : (
                          <span className="font-medium text-slate-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-800">
                        {entry.institutionType}
                      </span>
                      {entry.institutionName && (
                        <div className="mt-1 text-xs font-medium text-slate-500">
                          {entry.institutionName}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{entry.intendedOfficer}</div>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate" title={entry.purpose}>
                      <div className="text-slate-600 line-clamp-2">{entry.purpose}</div>
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-slate-500 whitespace-nowrap">
                      {formatDate(entry.visitDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          {/* MOBILE VIEW: Simplified List */}
          <motion.div variants={itemVariants} className="grid gap-3 md:hidden">
            {currentEntries.map((entry) => {
              const isExpanded = expandedId === entry.id;
              return (
                <div 
                  key={entry.id} 
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                  className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white/80 shadow-sm transition-all hover:shadow-md cursor-pointer active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between p-4">
                    <div className="flex-1 min-w-0 pr-4">
                      <h4 className="font-bold text-slate-900 text-sm truncate">{entry.guestName}</h4>
                      <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1.5">
                        <span className="font-medium">Tujuan:</span>
                        <span className="font-semibold text-slate-700 truncate">{entry.intendedOfficer}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-500/20">
                        {entry.institutionType}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                          {formatDate(entry.visitDate).includes(",") 
                            ? formatDate(entry.visitDate).split(",")[0] 
                            : formatDate(entry.visitDate)}
                        </span>
                        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Content */}
                  <motion.div 
                    initial={false}
                    animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-1 border-t border-slate-100/60 mt-1 space-y-3 bg-slate-50/50">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Instansi</p>
                          <p className="text-xs font-semibold text-slate-800 mt-0.5">{entry.institutionName || "-"}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">WhatsApp</p>
                          <p className="text-xs font-semibold text-emerald-600 mt-0.5">
                            {entry.whatsapp && entry.whatsapp !== "-" ? (
                              <RevealPhone phone={entry.whatsapp} />
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Keperluan</p>
                        <p className="text-[11.5px] font-medium text-slate-600 mt-0.5 leading-relaxed">{entry.purpose}</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </motion.div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <motion.div variants={itemVariants} className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 border-t border-slate-100 pt-5">
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
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 border border-slate-200 bg-white shadow-sm hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <span>Selanjutnya</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              
              <div className="flex items-center gap-1 order-1 sm:order-2">
                <span className="text-xs font-semibold text-slate-500">
                  Halaman <span className="text-slate-900">{currentPage}</span> dari <span className="text-slate-900">{totalPages}</span>
                </span>
              </div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
