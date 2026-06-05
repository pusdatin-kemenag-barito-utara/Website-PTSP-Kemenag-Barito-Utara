"use client";

import { useState, useTransition } from "react";
import { 
  Search, 
  Trash2, 
  Phone, 
  User, 
  MessageSquare, 
  Calendar, 
  Download, 
  AlertTriangle,
  Loader2,
  X,
  EyeOff
} from "lucide-react";
import { toast } from "sonner";
import { deleteFeedbackAction } from "@/lib/actions/admin/admin-feedbacks";
import { motion, AnimatePresence } from "framer-motion";

interface FeedbackEntry {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  serviceType: string;
  isAnonymous: boolean;
  content: string;
  createdAt: string;
}

export function SaranPengaduanClient({
  initialEntries,
}: {
  initialEntries: FeedbackEntry[];
}) {
  const [entries, setEntries] = useState<FeedbackEntry[]>(initialEntries);
  const [search, setSearch] = useState("");
  const [datePreset, setDatePreset] = useState("all"); // all, today, week, month
  
  // Deletion Modal State
  const [deletingEntry, setDeletingEntry] = useState<FeedbackEntry | null>(null);
  const [isPending, startTransition] = useTransition();

  // Filter logic
  const filteredEntries = entries.filter((entry) => {
    // 1. Text Search
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      entry.name.toLowerCase().includes(searchLower) ||
      entry.phone.includes(searchLower) ||
      entry.category.toLowerCase().includes(searchLower) ||
      entry.serviceType.toLowerCase().includes(searchLower) ||
      entry.content.toLowerCase().includes(searchLower);

    // 2. Date Preset Filter
    let matchesDate = true;
    if (datePreset !== "all") {
      const visitDateObj = new Date(entry.createdAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (datePreset === "today") {
        const entryDay = new Date(visitDateObj);
        entryDay.setHours(0, 0, 0, 0);
        matchesDate = entryDay.getTime() === today.getTime();
      } else if (datePreset === "week") {
        const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = visitDateObj >= oneWeekAgo;
      } else if (datePreset === "month") {
        const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchesDate = visitDateObj >= oneMonthAgo;
      }
    }

    return matchesSearch && matchesDate;
  });

  const handleDelete = () => {
    if (!deletingEntry) return;

    startTransition(async () => {
      const res = await deleteFeedbackAction(deletingEntry.id);
      if (res.success) {
        toast.success("Berhasil dihapus", {
          description: `Saran dari ${deletingEntry.name} berhasil dihapus dari sistem.`,
        });
        setEntries((prev) => prev.filter((e) => e.id !== deletingEntry.id));
        setDeletingEntry(null);
      } else {
        toast.error("Gagal menghapus", {
          description: res.error || "Terjadi kesalahan sistem.",
        });
      }
    });
  };

  // Client-side CSV Export
  const handleExportCSV = () => {
    if (filteredEntries.length === 0) {
      toast.warning("Tidak ada data untuk diekspor");
      return;
    }

    const headers = ["ID", "Waktu Pengiriman", "Kategori", "Jenis Layanan", "Nama Pengirim", "Handphone", "Isi Saran / Pengaduan"];
    const csvContent = [
      headers.join(","),
      ...filteredEntries.map((e) => [
        e.id,
        `"${new Date(e.createdAt).toLocaleString("id-ID")}"`,
        `"${e.category}"`,
        `"${e.serviceType}"`,
        `"${e.name.replace(/"/g, '""')}${e.isAnonymous ? " (Memilih Anonim)" : ""}"`,
        `"${e.phone}"`,
        `"${e.content.replace(/"/g, '""')}"`,
      ].join(","))
    ].join("\n");

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Saran_Pengaduan_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Ekspor Berhasil", {
      description: `${filteredEntries.length} data saran & pengaduan berhasil diunduh sebagai file CSV.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* ── FILTER CARD ─────────────────────────────────────────── */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <MessageSquare className="h-4.5 w-4.5 text-emerald-600" />
            Filter Pencarian Saran & Pengaduan
          </h3>
          <button
            onClick={handleExportCSV}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md shadow-emerald-950/10 hover:shadow-lg hover:shadow-emerald-950/20 transition-all active:scale-95 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Ekspor CSV
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search bar */}
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
            <input
              type="text"
              placeholder="Cari nama pengirim, nomor HP, isi pengaduan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 h-11 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-emerald-500 focus:bg-white text-sm font-semibold text-slate-700 transition-all"
            />
            {search && (
              <button 
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 text-slate-400 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Date Filter */}
          <div className="relative">
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value)}
              className="w-full px-4 h-11 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-emerald-500 focus:bg-white text-xs font-bold text-slate-600 appearance-none cursor-pointer"
            >
              <option value="all">Semua Waktu</option>
              <option value="today">Hari Ini</option>
              <option value="week">7 Hari Terakhir</option>
              <option value="month">30 Hari Terakhir</option>
            </select>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-500 w-0 h-0" />
          </div>
        </div>
      </div>

      {/* ── TABLE CARD ─────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100">
                <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-wider text-slate-400">Pengirim</th>
                <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-wider text-slate-400">Kategori & Layanan</th>
                <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-wider text-slate-400">Isi Saran / Pengaduan</th>
                <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-wider text-slate-400">Tanggal Pengiriman</th>
                <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-wider text-slate-400 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence mode="popLayout">
                {filteredEntries.map((entry) => (
                  <motion.tr 
                    key={entry.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-slate-50/40 transition-colors group"
                  >
                    {/* Contributor Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center font-bold">
                          {entry.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-800">
                              {entry.name}
                            </p>
                            {entry.isAnonymous && (
                              <span 
                                title="Pengguna meminta identitas dirahasiakan (Anonim) di Publik" 
                                className="flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest cursor-help"
                              >
                                <EyeOff className="h-3 w-3" /> Anonim
                              </span>
                            )}
                          </div>
                          <a 
                            href={`https://wa.me/${entry.phone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors mt-0.5"
                          >
                            <Phone className="h-3 w-3 shrink-0" />
                            {entry.phone}
                          </a>
                        </div>
                      </div>
                    </td>

                    {/* Kategori & Layanan */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <span className={`inline-flex w-fit items-center px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                          entry.category === 'Pengaduan' 
                            ? 'bg-rose-50 text-rose-600 border border-rose-100'
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        }`}>
                          {entry.category}
                        </span>
                        <span className="text-xs font-bold text-slate-600">
                          {entry.serviceType}
                        </span>
                      </div>
                    </td>

                    {/* Feedback Content */}
                    <td className="px-6 py-4 max-w-lg">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
                        <p className="text-xs font-semibold text-slate-700 leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                      </div>
                    </td>

                    {/* Date Received */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
                        <span className="text-xs font-bold text-slate-700">
                          {new Date(entry.createdAt).toLocaleString("id-ID", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setDeletingEntry(entry)}
                        className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all cursor-pointer active:scale-90"
                        title="Hapus Saran"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredEntries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="h-14 w-14 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center mb-4">
              <MessageSquare className="h-7 w-7" />
            </div>
            <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm mb-1">Catatan Tidak Ditemukan</h3>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Tidak ada catatan saran & pengaduan yang cocok dengan filter atau pencarian Anda saat ini.
            </p>
          </div>
        )}

        {/* Footer info */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-bold">
          <span>Menampilkan {filteredEntries.length} dari {entries.length} data saran & pengaduan</span>
          <span>Sistem Pengaduan Digital</span>
        </div>
      </div>

      {/* ── DELETION MODAL ───────────────────────────────────────── */}
      <AnimatePresence>
        {deletingEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeletingEntry(null)}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 p-6 space-y-6"
            >
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-black text-slate-900 text-base uppercase tracking-tight">Hapus Saran & Pengaduan?</h3>
                  <p className="text-xs text-slate-500 font-bold leading-relaxed">
                    Anda akan menghapus saran & pengaduan dari pengirim <span className="text-slate-800 font-black">{deletingEntry.name}</span> secara permanen. Tindakan ini tidak dapat dibatalkan.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeletingEntry(null)}
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider text-slate-500 hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isPending}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-red-600 to-rose-600 shadow-md shadow-rose-900/10 hover:shadow-lg hover:shadow-rose-900/20 hover:from-red-700 hover:to-rose-700 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Ya, Hapus Permanen
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
