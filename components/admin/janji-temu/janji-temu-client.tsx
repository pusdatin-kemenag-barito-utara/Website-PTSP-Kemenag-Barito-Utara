"use client";

import { useState, useTransition, useEffect } from "react";
import { 
  Search, 
  Trash2, 
  Phone, 
  Building2, 
  User, 
  MessageSquare, 
  Calendar, 
  Clock, 
  Download, 
  CalendarCheck, 
  AlertTriangle,
  Loader2,
  X,
  CheckCircle,
  XCircle,
  Clock3
} from "lucide-react";
import { toast } from "sonner";
import { 
  deleteAppointmentAction, 
  updateAppointmentStatusAction 
} from "@/lib/actions/admin/admin-visitations";
import { motion, AnimatePresence } from "framer-motion";

interface AppointmentEntry {
  id: string;
  appointmentDate: string;
  appointmentTime: string;
  guestName: string;
  whatsapp: string;
  institutionType: string;
  institutionName: string | null;
  intendedOfficer: string;
  purpose: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export function JanjiTemuClient({
  initialEntries,
}: {
  initialEntries: AppointmentEntry[];
}) {
  const [entries, setEntries] = useState<AppointmentEntry[]>(initialEntries);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all"); // all, today, upcoming, past

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals
  const [deletingEntry, setDeletingEntry] = useState<AppointmentEntry | null>(null);
  const [isPending, startTransition] = useTransition();
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  // Filter logic
  const filteredEntries = entries.filter((entry) => {
    // 1. Text Search
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      entry.guestName.toLowerCase().includes(searchLower) ||
      entry.whatsapp.includes(searchLower) ||
      (entry.institutionName || "").toLowerCase().includes(searchLower) ||
      entry.intendedOfficer.toLowerCase().includes(searchLower) ||
      entry.purpose.toLowerCase().includes(searchLower);

    // 2. Status Filter
    const matchesStatus = statusFilter === "all" || entry.status === statusFilter;

    // 3. Date Filter
    let matchesDate = true;
    if (dateFilter !== "all") {
      const [y, m, d] = entry.appointmentDate.split("-").map(Number);
      const entryDay = new Date(y, m - 1, d);
      entryDay.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dateFilter === "today") {
        matchesDate = entryDay.getTime() === today.getTime();
      } else if (dateFilter === "upcoming") {
        matchesDate = entryDay >= today;
      } else if (dateFilter === "past") {
        matchesDate = entryDay < today;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const currentEntries = filteredEntries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, dateFilter]);

  const [rejectingEntry, setRejectingEntry] = useState<AppointmentEntry | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const handleUpdateStatus = async (entry: AppointmentEntry, newStatus: "approved" | "rejected", note?: string) => {
    setPendingIds((prev) => new Set(prev).add(entry.id));
    const res = await updateAppointmentStatusAction(entry.id, newStatus);
    if (res.success) {
      toast.success(newStatus === "approved" ? "Janji Temu Disetujui" : "Janji Temu Ditolak", {
        description: `Status janji temu berhasil diperbarui. Membuka WhatsApp...`,
      });

      setEntries((prev) => 
        prev.map((e) => e.id === entry.id ? { ...e, status: newStatus } : e)
      );

      // Generate WhatsApp link with automated template message
      const cleanPhone = entry.whatsapp.replace(/\D/g, "");
      const formattedPhone = cleanPhone.startsWith("0") ? `62${cleanPhone.slice(1)}` : cleanPhone;
      
      const [y, m, d] = entry.appointmentDate.split("-").map(Number);
      const appointmentDateFormatted = new Date(y, m - 1, d).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const isApproved = newStatus === "approved";
      const waText = 
        `Halo *${entry.guestName}*\n\n` +
        `Permohonan janji temu Anda di *PTSP Kemenag Barito Utara* telah *${isApproved ? "DISETUJUI" : "DITOLAK"}* oleh Admin.\n\n` +
        `*Detail Janji Temu:*\n` +
        `• Tanggal : ${appointmentDateFormatted}\n` +
        `• Jam : ${entry.appointmentTime} WIB\n` +
        `• Bertemu : ${entry.intendedOfficer}\n` +
        `• Keperluan: ${entry.purpose}\n` +
        (entry.institutionName ? `• Instansi : ${entry.institutionName}\n` : "") +
        (isApproved 
          ? `\nMohon hadir tepat waktu sesuai dengan jadwal yang telah disetujui. Tunjukkan pesan ini kepada petugas saat Anda tiba di lokasi.\n\n` 
          : `\n*Alasan / Catatan Penolakan:*\n${note || "Mohon maaf, jadwal belum dapat dipenuhi saat ini."}\n\n`) +
        `_Pelayanan Terpadu Satu Pintu (PTSP)_\n` +
        `_Kemenag Kabupaten Barito Utara_`;

      const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(waText)}`;
      window.open(waUrl, "_blank");
    } else {
      toast.error("Gagal memperbarui status", {
        description: res.error || "Terjadi kesalahan sistem.",
      });
    }
    setPendingIds((prev) => {
      const next = new Set(prev);
      next.delete(entry.id);
      return next;
    });
  };

  const handleDelete = () => {
    if (!deletingEntry) return;

    startTransition(async () => {
      const res = await deleteAppointmentAction(deletingEntry.id);
      if (res.success) {
        toast.success("Berhasil dihapus", {
          description: `Janji temu oleh ${deletingEntry.guestName} berhasil dihapus.`,
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

    const headers = ["ID", "Tanggal Pertemuan", "Jam", "Nama Tamu", "WhatsApp", "Jenis Instansi", "Nama Instansi", "Petugas Dituju", "Keperluan", "Status"];
    const csvContent = [
      headers.join(","),
      ...filteredEntries.map((e) => [
        e.id,
        `"${e.appointmentDate}"`,
        `"${e.appointmentTime}"`,
        `"${e.guestName.replace(/"/g, '""')}"`,
        `"${e.whatsapp}"`,
        `"${e.institutionType}"`,
        `"${(e.institutionName || "").replace(/"/g, '""')}"`,
        `"${e.intendedOfficer.replace(/"/g, '""')}"`,
        `"${e.purpose.replace(/"/g, '""')}"`,
        `"${e.status.toUpperCase()}"`,
      ].join(","))
    ].join("\n");

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Janji_Temu_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Ekspor Berhasil", {
      description: `${filteredEntries.length} data janji temu berhasil diunduh sebagai file CSV.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* ── FILTER CARD ─────────────────────────────────────────── */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <CalendarCheck className="h-4.5 w-4.5 text-emerald-600" />
            Filter Pencarian Janji Temu
          </h3>
          <button
            onClick={handleExportCSV}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md shadow-emerald-950/10 hover:shadow-lg hover:shadow-emerald-950/20 transition-all active:scale-95 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Ekspor CSV
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search bar */}
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
            <input
              type="text"
              placeholder="Cari nama, whatsapp, instansi..."
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
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 h-11 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-emerald-500 focus:bg-white text-xs font-bold text-slate-600 appearance-none cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Menunggu Persetujuan</option>
              <option value="approved">Disetujui</option>
              <option value="rejected">Ditolak</option>
            </select>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-500 w-0 h-0" />
          </div>

          {/* Date Range Filter */}
          <div className="relative">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 h-11 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-emerald-500 focus:bg-white text-xs font-bold text-slate-600 appearance-none cursor-pointer"
            >
              <option value="all">Semua Tanggal Pertemuan</option>
              <option value="today">Pertemuan Hari Ini</option>
              <option value="upcoming">Pertemuan Mendatang (Terbaru)</option>
              <option value="past">Pertemuan Lampau</option>
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
                <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-wider text-slate-400">Pengunjung</th>
                <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-wider text-slate-400">Waktu & Tanggal</th>
                <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-wider text-slate-400">Instansi & Tujuan</th>
                <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-wider text-slate-400">Keperluan</th>
                <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-wider text-slate-400 text-center">Status</th>
                <th className="px-6 py-4.5 text-[10px] font-black uppercase tracking-wider text-slate-400 text-center">Tindakan Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence mode="popLayout">
                {currentEntries.map((entry) => {
                  let statusBadgeClass = "bg-amber-50 text-amber-700 border-amber-200/50";
                  let statusText = "Menunggu";
                  let StatusIcon = Clock3;

                  if (entry.status === "approved") {
                    statusBadgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200/50";
                    statusText = "Disetujui";
                    StatusIcon = CheckCircle;
                  } else if (entry.status === "rejected") {
                    statusBadgeClass = "bg-rose-50 text-rose-700 border-rose-200/50";
                    statusText = "Ditolak";
                    StatusIcon = XCircle;
                  }

                  return (
                    <motion.tr 
                      key={entry.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-slate-50/40 transition-colors group"
                    >
                      {/* Visitor Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center font-bold ${
                            entry.status === "approved" ? "bg-emerald-50 text-emerald-700" : entry.status === "rejected" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"
                          }`}>
                            {entry.guestName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{entry.guestName}</p>
                            <a 
                              href={`https://wa.me/${entry.whatsapp.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors mt-0.5"
                            >
                              <Phone className="h-3 w-3 shrink-0" />
                              {entry.whatsapp}
                            </a>
                          </div>
                        </div>
                      </td>

                      {/* Appointment Time & Date */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            <span>
                              {new Date(entry.appointmentDate).toLocaleString("id-ID", {
                                dateStyle: "medium"
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            <span>Pukul {entry.appointmentTime} WIB</span>
                          </div>
                        </div>
                      </td>

                      {/* Instansi & Officer */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="text-xs font-bold text-slate-700 truncate max-w-[150px]">
                              {entry.institutionName || entry.institutionType}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="text-[11px] font-bold text-slate-500 truncate max-w-[150px]">
                              Dituju: {entry.intendedOfficer}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Purpose */}
                      <td className="px-6 py-4 max-w-xs">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
                          <p className="text-xs font-medium text-slate-600 line-clamp-2 leading-relaxed">{entry.purpose}</p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${statusBadgeClass}`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusText}
                        </span>
                      </td>

                      {/* Actions & Status Updates */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {entry.status !== "approved" && (
                            <button
                              onClick={() => handleUpdateStatus(entry, "approved")}
                              disabled={pendingIds.has(entry.id)}
                              className={`p-2 rounded-xl bg-emerald-50 text-emerald-600 shadow-sm transition-all cursor-pointer active:scale-90 ${pendingIds.has(entry.id) ? "opacity-50 cursor-not-allowed" : "hover:bg-emerald-100 hover:text-emerald-700"}`}
                              title="Setujui Janji Temu"
                            >
                              {pendingIds.has(entry.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                            </button>
                          )}
                          {entry.status !== "rejected" && (
                            <button
                              onClick={() => {
                                setRejectReason("");
                                setRejectingEntry(entry);
                              }}
                              disabled={pendingIds.has(entry.id)}
                              className={`p-2 rounded-xl bg-rose-50 text-rose-600 shadow-sm transition-all cursor-pointer active:scale-90 ${pendingIds.has(entry.id) ? "opacity-50 cursor-not-allowed" : "hover:bg-rose-100 hover:text-rose-700"}`}
                              title="Tolak Janji Temu"
                            >
                              {pendingIds.has(entry.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                            </button>
                          )}
                          <button
                            onClick={() => setDeletingEntry(entry)}
                            disabled={pendingIds.has(entry.id)}
                            className={`p-2 rounded-xl text-slate-400 transition-all active:scale-90 ${pendingIds.has(entry.id) ? "opacity-50 cursor-not-allowed" : "hover:bg-red-50 hover:text-red-600 cursor-pointer"}`}
                            title="Hapus Janji Temu"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredEntries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="h-14 w-14 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center mb-4">
              <CalendarCheck className="h-7 w-7" />
            </div>
            <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm mb-1">Janji Temu Tidak Ditemukan</h3>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Tidak ada catatan janji temu yang cocok dengan filter atau pencarian Anda saat ini.
            </p>
          </div>
        )}

        {/* Footer info */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-bold">
          <span>
            {filteredEntries.length > 0
              ? `Menampilkan ${(currentPage - 1) * itemsPerPage + 1}–${Math.min(currentPage * itemsPerPage, filteredEntries.length)} dari ${filteredEntries.length} data janji temu`
              : `0 dari ${entries.length} data janji temu`}
          </span>
          <span>Sistem Penjadwalan Tamu</span>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              Halaman {currentPage} dari {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors cursor-pointer"
              >
                Sebelumnya
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors cursor-pointer"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
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
                  <h3 className="font-black text-slate-900 text-base uppercase tracking-tight">Hapus Jadwal Janji Temu?</h3>
                  <p className="text-xs text-slate-500 font-bold leading-relaxed">
                    Anda akan menghapus pengajuan janji temu dari <span className="text-slate-800 font-black">{deletingEntry.guestName}</span> secara permanen. Tindakan ini tidak dapat dibatalkan.
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
      {/* ── REJECTION REASON MODAL ───────────────────────────────────────── */}
      <AnimatePresence>
        {rejectingEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setRejectingEntry(null)}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 p-6 space-y-5"
            >
              <div className="flex items-start gap-4">
                <div className="h-11 w-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <XCircle className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-base">Tolak Janji Temu</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Tuliskan alasan penolakan permohonan janji temu dari <strong className="text-slate-800">{rejectingEntry.guestName}</strong> untuk dikirimkan ke WhatsApp pemohon.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Catatan / Alasan Penolakan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Contoh: Bapak Kepala Kantor sedang ada tugas dinas di luar kota pada tanggal tersebut..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 focus:border-rose-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setRejectingEntry(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    const entryToReject = rejectingEntry;
                    const reason = rejectReason;
                    setRejectingEntry(null);
                    handleUpdateStatus(entryToReject, "rejected", reason);
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Tolak & Kirim WA</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
