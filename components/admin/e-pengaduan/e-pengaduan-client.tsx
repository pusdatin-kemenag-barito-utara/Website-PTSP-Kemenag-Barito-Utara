"use client";

import { useState, useTransition, useMemo } from "react";
import { 
  Search, 
  Trash2, 
  Phone, 
  MessageSquare, 
  Calendar, 
  Download, 
  AlertTriangle,
  Loader2,
  X,
  EyeOff,
  CheckCircle,
  MessageCircle,
  BarChart3,
  Filter,
  ArrowUpDown,
  Send
} from "lucide-react";
import { toast } from "sonner";
import { 
  deleteFeedbackAction, 
  updateFeedbackStatusAction, 
  replyFeedbackAction 
} from "@/lib/actions/admin/admin-feedbacks";
import { motion, AnimatePresence } from "framer-motion";

interface FeedbackEntry {
  id: string;
  name: string;
  phone: string;
  category: string;
  serviceType: string;
  isAnonymous: boolean;
  content: string;
  status: "pending" | "processed" | "responded";
  adminReply: string | null;
  createdAt: string;
  ticketNumber?: string | null;
  attachmentUrl?: string | null;
  incidentDate?: string | null;
  incidentLocation?: string | null;
}

export function EPengaduanClient({
  initialEntries,
}: {
  initialEntries: FeedbackEntry[];
}) {
  const [entries, setEntries] = useState<FeedbackEntry[]>(initialEntries);
  
  // View mode
  const [activeTab, setActiveTab] = useState<"data" | "stats">("data");

  // Filter states
  const [search, setSearch] = useState("");
  const [datePreset, setDatePreset] = useState("all"); 
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Modals & Actions
  const [deletingEntry, setDeletingEntry] = useState<FeedbackEntry | null>(null);
  const [replyingEntry, setReplyingEntry] = useState<FeedbackEntry | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  // Derive unique service types for filter dropdown
  const uniqueServices = useMemo(() => {
    const services = new Set<string>();
    entries.forEach(e => services.add(e.serviceType));
    return Array.from(services).sort();
  }, [entries]);

  // Apply Filters
  const filteredEntries = useMemo(() => {
    let result = entries.filter((entry) => {
      // 1. Text Search
      const searchLower = search.toLowerCase();
      const matchesSearch = 
        entry.name.toLowerCase().includes(searchLower) ||
        entry.phone.includes(searchLower) ||
        entry.content.toLowerCase().includes(searchLower);

      // 2. Filters
      const matchesStatus = statusFilter === "all" || entry.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || entry.category === categoryFilter;
      const matchesService = serviceFilter === "all" || entry.serviceType === serviceFilter;

      // 3. Date Preset
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

      return matchesSearch && matchesStatus && matchesCategory && matchesService && matchesDate;
    });

    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [entries, search, statusFilter, categoryFilter, serviceFilter, datePreset, sortOrder]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const currentEntries = filteredEntries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when filters change
  useMemo(() => setCurrentPage(1), [search, statusFilter, categoryFilter, serviceFilter, datePreset, sortOrder]);

  // Actions
  const handleUpdateStatus = async (id: string, newStatus: "pending" | "processed" | "responded") => {
    setPendingIds((prev) => new Set(prev).add(id));
    const res = await updateFeedbackStatusAction(id, newStatus);
    if (res.success) {
      toast.success("Status Diperbarui", { description: res.message });
      setEntries((prev) => prev.map((e) => e.id === id ? { ...e, status: newStatus } : e));
    } else {
      toast.error("Gagal Memperbarui", { description: res.error });
    }
    setPendingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleReply = () => {
    if (!replyingEntry || !replyText.trim()) return;
    
    startTransition(async () => {
      const res = await replyFeedbackAction(replyingEntry.id, replyText);
      if (res.success) {
        toast.success("Tanggapan Terkirim", { description: "Notifikasi WA telah dikirim ke pelapor." });
        setEntries((prev) => prev.map((e) => e.id === replyingEntry.id ? { ...e, status: "responded", adminReply: replyText } : e));
        setReplyingEntry(null);
        setReplyText("");
      } else {
        toast.error("Gagal Menanggapi", { description: res.error });
      }
    });
  };

  const handleDelete = () => {
    if (!deletingEntry) return;

    startTransition(async () => {
      const res = await deleteFeedbackAction(deletingEntry.id);
      if (res.success) {
        toast.success("Berhasil dihapus", {
          description: `Catatan berhasil dihapus dari sistem.`,
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

  // Export CSV
  const handleExportCSV = () => {
    if (filteredEntries.length === 0) {
      toast.warning("Tidak ada data untuk diekspor");
      return;
    }

    const headers = ["ID", "Waktu Pengiriman", "Kategori", "Jenis Layanan", "Nama Pengirim", "Handphone", "Isi Saran / Pengaduan", "Status", "Tanggapan Admin"];
    const csvContent = [
      headers.join(","),
      ...filteredEntries.map((e) => [
        e.id,
        `"${new Date(e.createdAt).toLocaleString("id-ID")}"`,
        `"${e.category}"`,
        `"${e.serviceType}"`,
        `"${e.name.replace(/"/g, '""')}${e.isAnonymous ? " (Memilih Anonim)" : ""}"`,
        `"${e.phone}"`,
        `"${e.ticketNumber || "-"}"`,
        `"${e.incidentDate || "-"}"`,
        `"${e.incidentLocation || "-"}"`,
        `"${e.content.replace(/"/g, '""')}"`,
        `"${e.attachmentUrl || "-"}"`,
        `"${e.status}"`,
        `"${e.adminReply ? e.adminReply.replace(/"/g, '""') : ""}"`,
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
      description: `${filteredEntries.length} data berhasil diunduh sebagai file CSV.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* ── TABS ─────────────────────────────────────────── */}
      <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-slate-100 w-fit">
        <button
          onClick={() => setActiveTab("data")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "data" 
              ? "bg-slate-100 text-slate-800 shadow-sm" 
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          Data Pengaduan
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "stats" 
              ? "bg-slate-100 text-slate-800 shadow-sm" 
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          Statistik
        </button>
      </div>

      {activeTab === "stats" && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-600" />
            Statistik Saran & Pengaduan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
              <p className="text-emerald-800 text-sm font-bold uppercase tracking-wider mb-2">Total Tiket</p>
              <p className="text-4xl font-black text-emerald-600">{entries.length}</p>
            </div>
            <div className="bg-rose-50 rounded-2xl p-6 border border-rose-100">
              <p className="text-rose-800 text-sm font-bold uppercase tracking-wider mb-2">Belum Diproses (Pending)</p>
              <p className="text-4xl font-black text-rose-600">{entries.filter(e => e.status === "pending").length}</p>
            </div>
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
              <p className="text-blue-800 text-sm font-bold uppercase tracking-wider mb-2">Sudah Ditanggapi</p>
              <p className="text-4xl font-black text-blue-600">{entries.filter(e => e.status === "responded").length}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "data" && (
        <>
          {/* ── FILTER CARD ─────────────────────────────────────────── */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Filter className="h-4.5 w-4.5 text-emerald-600" />
                Filter & Sortir
              </h3>
              <button
                onClick={handleExportCSV}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md shadow-emerald-950/10 hover:shadow-lg hover:shadow-emerald-950/20 transition-all active:scale-95 cursor-pointer"
              >
                <Download className="h-4 w-4" />
                Ekspor CSV
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search bar */}
              <div className="relative group col-span-1 md:col-span-2 lg:col-span-4">
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

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 h-11 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-emerald-500 text-xs font-bold text-slate-600 appearance-none cursor-pointer"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="processed">Diproses</option>
                <option value="responded">Ditanggapi</option>
              </select>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 h-11 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-emerald-500 text-xs font-bold text-slate-600 appearance-none cursor-pointer"
              >
                <option value="all">Semua Kategori</option>
                <option value="Saran">Saran</option>
                <option value="Pengaduan">Pengaduan</option>
              </select>

              {/* Service Filter */}
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="w-full px-4 h-11 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-emerald-500 text-xs font-bold text-slate-600 appearance-none cursor-pointer"
              >
                <option value="all">Semua Layanan</option>
                {uniqueServices.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              {/* Date Filter & Sort */}
              <div className="flex gap-2">
                <select
                  value={datePreset}
                  onChange={(e) => setDatePreset(e.target.value)}
                  className="w-full px-4 h-11 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-emerald-500 text-xs font-bold text-slate-600 appearance-none cursor-pointer"
                >
                  <option value="all">Semua Waktu</option>
                  <option value="today">Hari Ini</option>
                  <option value="week">7 Hari Terakhir</option>
                  <option value="month">30 Hari Terakhir</option>
                </select>
                <button
                  onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}
                  className="h-11 w-11 shrink-0 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors"
                  title={sortOrder === "desc" ? "Terbaru" : "Terlama"}
                >
                  <ArrowUpDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ── TABLE CARD ─────────────────────────────────────────── */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100">
                    <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-wider text-slate-400">Pengirim & Tiket</th>
                    <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-wider text-slate-400">Status</th>
                    <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-wider text-slate-400">Isi Saran / Pengaduan</th>
                    <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-wider text-slate-400">Lampiran</th>
                    <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-wider text-slate-400">Tanggal</th>
                    <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-wider text-slate-400 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <AnimatePresence mode="popLayout">
                    {currentEntries.map((entry) => (
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
                              {entry.ticketNumber && (
                                <p className="text-[10px] font-mono font-bold text-slate-400 mt-1">
                                  #{entry.ticketNumber}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1.5">
                            <span className={`inline-flex w-fit items-center px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                              entry.status === 'pending' 
                                ? 'bg-amber-50 text-amber-600 border border-amber-100'
                                : entry.status === 'processed'
                                ? 'bg-blue-50 text-blue-600 border border-blue-100'
                                : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            }`}>
                              {entry.status === 'pending' ? 'Pending' : entry.status === 'processed' ? 'Diproses' : 'Ditanggapi'}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase">
                              {entry.category} - {entry.serviceType}
                            </span>
                          </div>
                        </td>

                        {/* Feedback Content */}
                        <td className="px-6 py-4 max-w-lg">
                          <div className="flex items-start gap-2">
                            <MessageSquare className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
                            <div className="space-y-1 w-full">
                              {(entry.incidentDate || entry.incidentLocation) && (
                                <div className="mb-2 p-2 bg-orange-50 rounded border border-orange-100 text-xs">
                                  <p className="font-bold text-orange-800 mb-1">Detail Kejadian:</p>
                                  {entry.incidentDate && <p className="text-orange-900">• Tanggal: {entry.incidentDate}</p>}
                                  {entry.incidentLocation && <p className="text-orange-900">• Lokasi: {entry.incidentLocation}</p>}
                                </div>
                              )}
                              <p className="text-xs font-semibold text-slate-700 leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                              {entry.adminReply && (
                                <div className="mt-2 p-2 bg-blue-50/50 rounded-lg border border-blue-100 text-xs">
                                  <p className="font-bold text-blue-800 mb-0.5">Tanggapan Admin:</p>
                                  <p className="text-blue-900 leading-relaxed">{entry.adminReply}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Lampiran */}
                        <td className="px-6 py-4">
                          {entry.attachmentUrl ? (
                            <a 
                              href={entry.attachmentUrl.startsWith("http") ? entry.attachmentUrl : `/api/files?path=${encodeURIComponent(entry.attachmentUrl)}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold uppercase transition-colors"
                            >
                              <Download className="w-3 h-3" /> Lihat File
                            </a>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Tidak ada</span>
                          )}
                        </td>

                        {/* Date Received */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
                            <span className="text-xs font-bold text-slate-700">
                              {new Date(entry.createdAt).toLocaleString("id-ID", {
                                day: "numeric", month: "short", year: "numeric",
                                hour: "2-digit", minute: "2-digit"
                              })}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {entry.status === "pending" && (
                              <button
                                onClick={() => handleUpdateStatus(entry.id, "processed")}
                                disabled={pendingIds.has(entry.id)}
                                className={`p-2 rounded-xl bg-blue-50 text-blue-600 shadow-sm transition-all cursor-pointer active:scale-90 ${pendingIds.has(entry.id) ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-100 hover:text-blue-700"}`}
                                title="Tandai Diproses"
                              >
                                {pendingIds.has(entry.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                              </button>
                            )}
                            {entry.status !== "responded" && (
                              <button
                                onClick={() => setReplyingEntry(entry)}
                                disabled={pendingIds.has(entry.id)}
                                className={`p-2 rounded-xl bg-emerald-50 text-emerald-600 shadow-sm transition-all cursor-pointer active:scale-90 ${pendingIds.has(entry.id) ? "opacity-50 cursor-not-allowed" : "hover:bg-emerald-100 hover:text-emerald-700"}`}
                                title="Beri Tanggapan"
                              >
                                <MessageCircle className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => setDeletingEntry(entry)}
                              disabled={pendingIds.has(entry.id)}
                              className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all cursor-pointer active:scale-90"
                              title="Hapus"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors"
                  >
                    Sebelumnya
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredEntries.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="h-14 w-14 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center mb-4">
                  <MessageSquare className="h-7 w-7" />
                </div>
                <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm mb-1">Catatan Tidak Ditemukan</h3>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                  Tidak ada catatan yang cocok dengan filter atau pencarian Anda.
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── REPLY MODAL ───────────────────────────────────────── */}
      <AnimatePresence>
        {replyingEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setReplyingEntry(null)}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 p-6 space-y-6"
            >
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <div className="space-y-1 w-full">
                  <h3 className="font-black text-slate-900 text-base uppercase tracking-tight">Tanggapi Laporan</h3>
                  <p className="text-xs text-slate-500 font-bold leading-relaxed mb-4">
                    Kirim tanggapan langsung via WhatsApp ke <span className="text-slate-800 font-black">{replyingEntry.name}</span>.
                  </p>
                  
                  <textarea
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Tulis balasan atau tindak lanjut atas laporan ini..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 resize-none mt-2"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setReplyingEntry(null)}
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider text-slate-500 hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleReply}
                  disabled={isPending || !replyText.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-emerald-600 to-teal-600 shadow-md shadow-emerald-900/10 hover:shadow-lg hover:from-emerald-700 hover:to-teal-700 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Kirim Tanggapan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                    Anda akan menghapus laporan dari <span className="text-slate-800 font-black">{deletingEntry.name}</span> secara permanen.
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
                  className="flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-red-600 to-rose-600 shadow-md shadow-rose-900/10 hover:shadow-lg hover:from-red-700 hover:to-rose-700 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
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
