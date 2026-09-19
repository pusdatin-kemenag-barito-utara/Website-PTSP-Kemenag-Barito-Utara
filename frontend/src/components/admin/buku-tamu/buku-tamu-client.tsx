import { useState, useTransition, useEffect, useMemo } from "react";
import { useRouter } from "@/lib/next-compat/navigation";
import { 
  Search, 
  Trash2, 
  Phone, 
  Building2, 
  User, 
  MessageSquare, 
  Calendar, 
  CalendarCheck,
  CalendarDays,
  Download, 
  BookOpen, 
  AlertTriangle,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Users,
  Clock,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { toggleGuestBookModeAction, deleteGuestBookAction } from "@/lib/actions/admin/admin-visitations";
import { motion, AnimatePresence } from "framer-motion";
import { ModernSelect } from "@/components/ui/modern-select";

interface GuestBookEntry {
  id: string;
  visitDate: string;
  guestName: string;
  whatsapp: string;
  institutionType: string;
  institutionName: string | null;
  intendedOfficer: string;
  purpose: string;
  createdAt: string;
}

export function BukuTamuClient({
  initialEntries,
  initialAllowManual = false,
}: {
  initialEntries: GuestBookEntry[];
  initialAllowManual?: boolean;
}) {
  const router = useRouter();
  const [entries, setEntries] = useState<GuestBookEntry[]>(initialEntries);
  const [search, setSearch] = useState("");
  const [instTypeFilter, setInstTypeFilter] = useState("all");
  const [datePreset, setDatePreset] = useState("all"); // all, today, week, month

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isManualMode, setIsManualMode] = useState(initialAllowManual);
  const [isToggling, setIsToggling] = useState(false);
  
  // Deletion Modal State
  const [deletingEntry, setDeletingEntry] = useState<GuestBookEntry | null>(null);
  const [isPending, startTransition] = useTransition();

  // Institution type options
  const institutionTypes = Array.from(
    new Set(entries.map((e) => e.institutionType))
  ).filter(Boolean);

  // Quick Stats
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    let countToday = 0;
    let countWeek = 0;
    let countMonth = 0;

    entries.forEach((e) => {
      const d = new Date(e.visitDate);
      const day = new Date(d);
      day.setHours(0, 0, 0, 0);
      if (day.getTime() === today.getTime()) countToday++;
      if (d >= oneWeekAgo) countWeek++;
      if (d >= oneMonthAgo) countMonth++;
    });

    return {
      total: entries.length,
      today: countToday,
      week: countWeek,
      month: countMonth,
    };
  }, [entries]);

  // Filter logic
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // 1. Text Search
      const searchLower = search.toLowerCase();
      const matchesSearch =
        (entry.guestName || "").toLowerCase().includes(searchLower) ||
        (entry.whatsapp || "").includes(searchLower) ||
        (entry.institutionName || "").toLowerCase().includes(searchLower) ||
        (entry.intendedOfficer || "").toLowerCase().includes(searchLower) ||
        (entry.purpose || "").toLowerCase().includes(searchLower);

      // 2. Institution Type Filter
      const matchesType = instTypeFilter === "all" || entry.institutionType === instTypeFilter;

      // 3. Date Preset Filter
      let matchesDate = true;
      if (datePreset !== "all") {
        const visitDateObj = new Date(entry.visitDate);
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

      return matchesSearch && matchesType && matchesDate;
    });
  }, [entries, search, instTypeFilter, datePreset]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / itemsPerPage));
  const currentEntries = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEntries.slice(start, start + itemsPerPage);
  }, [filteredEntries, currentPage, itemsPerPage]);

  // Reset to page 1 when filters or itemsPerPage change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, instTypeFilter, datePreset, itemsPerPage]);

  // Pagination numbers generator
  const paginationPages = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  }, [currentPage, totalPages]);

  const handleDelete = async () => {
    if (!deletingEntry) return;
    const target = deletingEntry;
    setDeletingEntry(null);
    const toastId = toast.loading(`Sedang menghapus kunjungan ${target.guestName}...`);

    try {
      const res = await deleteGuestBookAction(target.id);
      if (res.success) {
        toast.success("Berhasil Dihapus", {
          id: toastId,
          description: `Catatan kunjungan ${target.guestName} berhasil dihapus dari sistem.`,
        });
        setEntries((prev) => prev.filter((e) => e.id !== target.id));
        router.refresh();
      } else {
        toast.error("Gagal menghapus", {
          id: toastId,
          description: res.error || "Terjadi kesalahan sistem.",
        });
      }
    } catch (err: any) {
      toast.error("Kesalahan jaringan", {
        id: toastId,
        description: err.message,
      });
    }
  };

  // Client-side CSV Export
  const handleExportCSV = () => {
    if (filteredEntries.length === 0) {
      toast.warning("Tidak ada data untuk diekspor");
      return;
    }

    const headers = ["ID", "Waktu Kunjungan", "Nama Tamu", "WhatsApp", "Jenis Instansi", "Nama Instansi", "Petugas Dituju", "Keperluan"];
    const csvContent = [
      headers.join(","),
      ...filteredEntries.map((e) => [
        e.id,
        `"${new Date(e.visitDate).toLocaleString("id-ID")}"`,
        `"${e.guestName.replace(/"/g, '""')}"`,
        `"${e.whatsapp}"`,
        `"${e.institutionType}"`,
        `"${(e.institutionName || "").replace(/"/g, '""')}"`,
        `"${e.intendedOfficer.replace(/"/g, '""')}"`,
        `"${e.purpose.replace(/"/g, '""')}"`,
      ].join(","))
    ].join("\n");

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Buku_Tamu_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Ekspor Berhasil", {
      description: `${filteredEntries.length} data buku tamu berhasil diunduh sebagai file CSV.`,
    });
  };

  const handleToggleMode = () => {
    setIsToggling(true);
    startTransition(async () => {
      const newMode = !isManualMode;
      const res = await toggleGuestBookModeAction(newMode);
      if (res.success) {
        setIsManualMode(newMode);
        toast.success("Mode Berhasil Diubah", {
          description: res.message,
        });
      } else {
        toast.error("Gagal Mengubah Mode", {
          description: res.error,
        });
      }
      setIsToggling(false);
    });
  };

  const getInstitutionBadgeClass = (type: string) => {
    const lower = (type || "").toLowerCase();
    if (lower.includes("pemerintah")) {
      return "bg-blue-50 text-blue-700 border-blue-200/60";
    }
    if (lower.includes("swasta")) {
      return "bg-amber-50 text-amber-700 border-amber-200/60";
    }
    if (lower.includes("pendidikan") || lower.includes("sekolah") || lower.includes("madrasah")) {
      return "bg-purple-50 text-purple-700 border-purple-200/60";
    }
    if (lower.includes("pribadi") || lower.includes("umum")) {
      return "bg-slate-100 text-slate-600 border-slate-200/60";
    }
    return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
  };

  return (
    <div className="space-y-4">
      {/* ── STATS SUMMARY CARDS ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Kunjungan */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Kunjungan
            </p>
            <p className="text-xl font-black text-slate-900 mt-0.5">{stats.total}</p>
          </div>
          <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* Hari Ini */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
              Hari Ini
            </p>
            <p className="text-xl font-black text-emerald-700 mt-0.5">{stats.today}</p>
          </div>
          <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CalendarCheck className="h-5 w-5" />
          </div>
        </div>

        {/* 7 Hari Terakhir */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-teal-600 uppercase tracking-wider">
              7 Hari Terakhir
            </p>
            <p className="text-xl font-black text-teal-700 mt-0.5">{stats.week}</p>
          </div>
          <div className="h-9 w-9 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
            <CalendarDays className="h-5 w-5" />
          </div>
        </div>

        {/* 30 Hari Terakhir */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
              30 Hari Terakhir
            </p>
            <p className="text-xl font-black text-indigo-700 mt-0.5">{stats.month}</p>
          </div>
          <div className="h-9 w-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Clock className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* ── MODE & CONTROLS CARD ────────────────────────────────── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-800 text-xs">Mode Input Buku Tamu (Formulir Publik)</h3>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              isManualMode 
                ? "bg-amber-50 text-amber-700 border-amber-200" 
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}>
              {isManualMode ? "Mode Bebas (Backdate)" : "Mode Realtime (Terkunci)"}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium max-w-xl mt-0.5">
            {isManualMode 
              ? "Pengunjung atau petugas di formulir publik dapat memilih tanggal kunjungan secara bebas di masa lalu." 
              : "Tanggal kunjungan di formulir publik dikunci otomatis pada tanggal dan jam hari ini."}
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
          <span className={`text-[10px] font-bold ${!isManualMode ? 'text-emerald-700 font-black' : 'text-slate-400'}`}>
            Otomatis
          </span>
          <button
            type="button"
            onClick={handleToggleMode}
            disabled={isToggling}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 cursor-pointer ${
              isManualMode ? 'bg-emerald-600' : 'bg-slate-300'
            } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Klik untuk mengubah mode input"
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                isManualMode ? 'translate-x-4.5' : 'translate-x-0.5'
              }`}
            />
          </button>
          <span className={`text-[10px] font-bold ${isManualMode ? 'text-emerald-700 font-black' : 'text-slate-400'}`}>
            Manual
          </span>
        </div>
      </div>

      {/* ── FILTER CARD ─────────────────────────────────────────── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <BookOpen className="h-4 w-4 text-emerald-600" />
            <span>Filter Data Kunjungan</span>
          </h3>
          <button
            type="button"
            onClick={handleExportCSV}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Ekspor CSV</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search bar */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-emerald-600 transition-colors pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama, whatsapp, instansi, petugas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 h-9 bg-slate-50/70 border border-slate-200/80 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white text-xs font-medium text-slate-800 transition-all placeholder:text-slate-400"
            />
            {search && (
              <button 
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 text-slate-400 transition-colors cursor-pointer"
                title="Hapus pencarian"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Instansi Type Filter */}
          <div>
            <ModernSelect
              value={instTypeFilter}
              onChange={(val) => setInstTypeFilter(val)}
              options={[
                { value: "all", label: "Semua Jenis Instansi" },
                ...institutionTypes.map((type) => ({ value: type, label: type })),
              ]}
              icon={Building2}
              placeholder="Semua Jenis Instansi"
            />
          </div>

          {/* Date Filter */}
          <div>
            <ModernSelect
              value={datePreset}
              onChange={(val) => setDatePreset(val)}
              options={[
                { value: "all", label: "Semua Waktu" },
                { value: "today", label: "Hari Ini" },
                { value: "week", label: "7 Hari Terakhir" },
                { value: "month", label: "30 Hari Terakhir" },
              ]}
              icon={Calendar}
              placeholder="Semua Waktu"
            />
          </div>
        </div>
      </div>

      {/* ── TABLE CONTAINER (FULL WIDTH) ────────────────────────── */}
      <div className="w-full bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 w-1/4">Pengunjung</th>
                <th className="py-3 px-4 w-1/5">Instansi</th>
                <th className="py-3 px-4 w-1/5">Petugas Dituju</th>
                <th className="py-3 px-4">Keperluan</th>
                <th className="py-3 px-4 w-36">Waktu Kunjungan</th>
                <th className="py-3 px-4 w-16 text-center">Aksi</th>
              </tr>
            </thead>
            <motion.tbody
              key={`page-${currentPage}`}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.12 }}
              className="divide-y divide-slate-100/80"
            >
              {currentEntries.map((entry, index) => {
                const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;
                return (
                  <tr 
                    key={entry.id}
                    className="hover:bg-slate-50/60 transition-colors group"
                  >
                    {/* Number */}
                    <td className="py-3 px-4 text-center font-bold text-slate-400">
                      {rowNumber}
                    </td>

                    {/* Visitor Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 shrink-0 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center font-bold text-xs border border-emerald-200/50 shadow-2xs">
                          {(entry.guestName || "G").charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {entry.guestName || "-"}
                          </p>
                          {entry.whatsapp ? (
                            <a 
                              href={`https://wa.me/${entry.whatsapp.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors mt-0.5"
                              title="Kirim Pesan WhatsApp"
                            >
                              <Phone className="h-2.5 w-2.5 shrink-0" />
                              <span>{entry.whatsapp}</span>
                            </a>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">-</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Institution */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-800">
                          {entry.institutionName || "-"}
                        </p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${getInstitutionBadgeClass(entry.institutionType)}`}>
                          <Building2 className="h-2.5 w-2.5 shrink-0" />
                          <span>{entry.institutionType || "Umum"}</span>
                        </span>
                      </div>
                    </td>

                    {/* Intended Officer */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <div className="h-6 w-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                          <User className="h-3 w-3" />
                        </div>
                        <span className="text-xs font-semibold text-slate-800">
                          {entry.intendedOfficer || "-"}
                        </span>
                      </div>
                    </td>

                    {/* Purpose */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex items-start gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5 shrink-0 text-slate-400 mt-0.5" />
                        <p className="text-xs font-medium text-slate-600 line-clamp-2 leading-relaxed" title={entry.purpose}>
                          {entry.purpose || "-"}
                        </p>
                      </div>
                    </td>

                    {/* Visit Date */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span className="text-xs font-medium">
                          {new Date(entry.visitDate).toLocaleString("id-ID", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setDeletingEntry(entry)}
                        className="p-1.5 rounded-xl text-rose-600 bg-rose-50/80 hover:bg-rose-100 hover:text-rose-700 border border-rose-200/60 shadow-2xs transition-all active:scale-95 cursor-pointer"
                        title="Hapus Kunjungan"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </motion.tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredEntries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="h-12 w-12 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mb-3">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm mb-0.5">Catatan Tidak Ditemukan</h3>
            <p className="text-xs text-slate-400 max-w-sm">
              Tidak ada data kunjungan buku tamu yang sesuai dengan pencarian atau filter Anda.
            </p>
          </div>
        )}

        {/* ── FOOTER & NUMBERED PAGINATION ────────────────────────── */}
        <div className="border-t border-slate-100 bg-slate-50/50 px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Info & Page Size */}
          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
            <span>
              {filteredEntries.length > 0 ? (
                <>
                  Menampilkan{" "}
                  <strong className="text-slate-800 font-bold">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </strong>
                  –
                  <strong className="text-slate-800 font-bold">
                    {Math.min(currentPage * itemsPerPage, filteredEntries.length)}
                  </strong>{" "}
                  dari{" "}
                  <strong className="text-slate-800 font-bold">
                    {filteredEntries.length}
                  </strong>{" "}
                  data
                </>
              ) : (
                "0 data kunjungan"
              )}
            </span>

            {/* Page Size Selector */}
            <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
              <span className="text-[11px] text-slate-400">Tampilkan:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Numbered Pagination Buttons */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              {/* Previous Button */}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Number Buttons */}
              {paginationPages.map((pageItem, i) => {
                if (pageItem === "...") {
                  return (
                    <div
                      key={`ellipsis-${i}`}
                      className="flex h-8 min-w-[32px] items-center justify-center text-slate-400"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </div>
                  );
                }

                const pageNum = pageItem as number;
                const isActive = pageNum === currentPage;

                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
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
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Halaman Selanjutnya"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── DELETION MODAL ───────────────────────────────────────── */}
      <AnimatePresence>
        {deletingEntry && (
          <div 
            onClick={() => setDeletingEntry(null)}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 text-center"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 mb-3">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-black text-slate-900">Hapus Catatan Kunjungan?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Apakah Anda yakin ingin menghapus catatan kunjungan dari <strong>"{deletingEntry.guestName}"</strong>? Tindakan ini tidak dapat dibatalkan.
              </p>

              <div className="flex items-center justify-center gap-2 mt-5">
                <button
                  type="button"
                  onClick={() => setDeletingEntry(null)}
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
                >
                  {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Ya, Hapus</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
