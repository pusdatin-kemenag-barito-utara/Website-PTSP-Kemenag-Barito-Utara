"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  FileText,
  User,
  ArrowUpRight,
  X,
  Loader2,
} from "lucide-react";
import {
  getSuratKeluarAction,
  saveSuratKeluarAction,
  deleteSuratKeluarAction,
  getNextNomorSuratSuggestionAction,
} from "@/lib/actions/admin/admin-persuratan";
import { ModernDatePicker } from "@/components/ui/modern-date-picker";
import { ModernSelect } from "@/components/ui/modern-select";
import { m, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const UNIT_COLORS: Record<string, string> = {
  Sekjend: "bg-emerald-50 text-emerald-600 border-emerald-100",
  "Bimas Islam": "bg-emerald-50 text-emerald-600 border-emerald-100",
  "Bimas Kristen": "bg-purple-50 text-purple-600 border-purple-100",
  "Pendidikan Madrasah": "bg-amber-50 text-amber-600 border-amber-100",
  "Pendidikan Agama Islam": "bg-sky-50 text-sky-600 border-sky-100",
  "Pendidikan Diniyah & Pontren": "bg-indigo-50 text-indigo-600 border-indigo-100",
  "Penyelenggara Hindu": "bg-rose-50 text-rose-600 border-rose-100",
  "Penyelenggara Zakat & Wakaf": "bg-teal-50 text-teal-600 border-teal-100",
};

const AGENDA_COLORS: Record<string, string> = {
  "Surat Dinas": "bg-emerald-50 text-emerald-600 border-emerald-100",
  "Surat Keputusan": "bg-red-50 text-red-600 border-red-100",
  "Surat Tugas": "bg-violet-50 text-violet-600 border-violet-100",
  "Surat Undangan": "bg-cyan-50 text-cyan-600 border-cyan-100",
  "Surat Pengantar": "bg-slate-50 text-slate-600 border-slate-100",
  "Surat Keterangan": "bg-orange-50 text-orange-600 border-orange-100",
  "Surat Pernyataan": "bg-pink-50 text-pink-600 border-pink-100",
  "Surat Cuti": "bg-lime-50 text-lime-600 border-lime-100",
  "Berita Acara": "bg-zinc-50 text-zinc-600 border-zinc-100",
  "Nota Dinas": "bg-emerald-50 text-emerald-600 border-emerald-100",
};

interface SuratKeluar {
  id: string;
  nomor_surat: string;
  tanggal_surat: string;
  tujuan_surat: string;
  perihal: string;
  unit_kerja: string;
  agenda: string;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
};

export function SuratKeluarManager() {
  const [items, setItems] = useState<SuratKeluar[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Filter States
  const [filterDate, setFilterDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Delete Confirmation State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    nomor_surat: "",
    tanggal_surat: "",
    tujuan_surat: "",
    perihal: "",
    unit_kerja: "Sekjend",
    agenda: "Surat Dinas",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setFetchError(null);
    const result = await getSuratKeluarAction();
    if (result.success) {
      setItems(result.data || []);
    } else {
      setFetchError(result.error || "Gagal mengambil data dari Google Sheets.");
    }
    setLoading(false);
  };

  const filteredItems = useMemo(() => {
    return items.filter((item: any) => {
      const matchesSearch =
        item.nomor_surat.toLowerCase().includes(search.toLowerCase()) ||
        item.tujuan_surat.toLowerCase().includes(search.toLowerCase()) ||
        item.perihal.toLowerCase().includes(search.toLowerCase());

      const matchesDate = (() => {
        if (!filterDate) return true;
        const itemDateStr = item.tanggal_surat?.trim();
        if (!itemDateStr) return false;

        // Direct match
        if (itemDateStr === filterDate.trim()) return true;

        // Try parsing both as dates for comparison
        try {
          const d1 = new Date(itemDateStr).getTime();
          const d2 = new Date(filterDate).getTime();
          return !isNaN(d1) && !isNaN(d2) && d1 === d2;
        } catch {
          return false;
        }
      })();

      return matchesSearch && matchesDate;
    });
  }, [items, search, filterDate]);

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterDate]);

  const totalPages = Math.ceil(filteredItems.length / rowsPerPage);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredItems.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredItems, currentPage, rowsPerPage]);

  const handleOpenForm = async (item?: SuratKeluar) => {
    if (item) {
      setFormData({
        nomor_surat: item.nomor_surat,
        tanggal_surat: item.tanggal_surat,
        tujuan_surat: item.tujuan_surat,
        perihal: item.perihal,
        unit_kerja: item.unit_kerja,
        agenda: item.agenda || "Surat Dinas",
      });
      setEditingId(item.id);
      setShowForm(true);
    } else {
      setFormData({
        nomor_surat: "",
        tanggal_surat: new Date().toISOString().split("T")[0],
        tujuan_surat: "",
        perihal: "",
        unit_kerja: "Sekjend",
        agenda: "Surat Dinas",
      });
      setEditingId(null);
      setShowForm(true);

      // Suggest next number (Disabled as requested)
      // const suggestion = await getNextNomorSuratSuggestionAction("KELUAR");
      // if (suggestion) {
      //   setFormData((prev) => ({ ...prev, nomor_surat: suggestion }));
      // }
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;

    setSubmitting(true);
    try {
      const result = await deleteSuratKeluarAction(deletingId);
      if (result.success) {
        toast.success(result.message || "Data surat keluar berhasil dihapus");
        await fetchData();
        setShowDeleteConfirm(false);
        setDeletingId(null);
      } else {
        toast.error(result.error || "Gagal menghapus data");
      }
    } catch (error) {
      toast.error("Gagal menghapus data");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const form = new FormData(e.currentTarget);
      if (editingId) form.append("id", editingId);

      const result = await saveSuratKeluarAction(form);

      if (result.success) {
        toast.success(result.message || "Data berhasil disimpan");
        await fetchData();
        setShowForm(false);
      } else {
        toast.error(result.error || "Gagal menyimpan data");
      }
    } catch (error) {
      toast.error("Gagal menyimpan data");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nomor surat, tujuan, atau perihal..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm border ${
              showFilters || filterDate
                ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Filter className="h-4 w-4" />
            Filter {filterDate ? "(Aktif)" : ""}
          </button>
          <button
            disabled={loading}
            onClick={fetchData}
            className="flex items-center justify-center p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
            title="Refresh Data"
          >
            <Loader2
              className={`h-4 w-4 ${loading ? "animate-spin text-emerald-600" : ""}`}
            />
          </button>
          <button
            onClick={() => handleOpenForm()}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#059669] text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-200"
          >
            <Plus className="h-4 w-4" />
            Buat Surat Baru
          </button>
        </div>
      </div>

      {/* Advanced Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <m.div
            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
            animate={{ height: "auto", opacity: 1, marginBottom: 24 }}
            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="relative z-50 pointer-events-auto"
            style={{ overflow: "visible" }}
          >
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 mb-1">
              <div className="space-y-1.5">
                <ModernDatePicker
                  label="Filter Berdasarkan Tanggal Surat"
                  value={filterDate}
                  onChange={(val) => setFilterDate(val)}
                />
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={() => setFilterDate("")}
                  className="flex-1 px-4 py-2 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-sm font-bold hover:bg-rose-100 transition-all flex items-center justify-center gap-2 shadow-sm shadow-rose-100"
                >
                  <X className="h-3.5 w-3.5" />
                  Reset Filter
                </button>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Table Section */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm min-h-[400px] relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-4 py-2.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider text-center w-12">
                  No
                </th>
                <th className="px-6 py-2.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Info Surat
                </th>
                <th className="px-6 py-2.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-2.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Agenda
                </th>
                <th className="px-6 py-2.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Unit Kerja
                </th>
                <th className="px-6 py-2.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Tujuan & Perihal
                </th>
                <th className="px-6 py-2.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedItems.length > 0 ? (
                paginatedItems.map((item: any, index: number) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-4 py-2.5 text-center">
                      <span className="text-xs font-bold text-slate-400">
                        {(currentPage - 1) * rowsPerPage + index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-2.5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-sm font-bold text-slate-900">
                            {item.nomor_surat}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 ml-8 font-medium">
                          REF: {item.id}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-2.5">
                      <div className="flex items-center gap-2 text-xs text-slate-600 font-bold bg-slate-100 w-fit px-3 py-1.5 rounded-lg border border-slate-200">
                        <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                        <span>{formatDate(item.tanggal_surat)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-2.5">
                      <div
                        className={`flex items-center gap-2 text-[10px] font-extrabold w-fit px-2.5 py-1 rounded-md border uppercase tracking-tight ${
                          AGENDA_COLORS[item.agenda] ||
                          "bg-slate-50 text-slate-600 border-slate-100"
                        }`}
                      >
                        {item.agenda}
                      </div>
                    </td>
                    <td className="px-6 py-2.5">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-extrabold border uppercase ${
                          UNIT_COLORS[item.unit_kerja] ||
                          "bg-slate-50 text-slate-600 border-slate-100"
                        }`}
                      >
                        {item.unit_kerja}
                      </span>
                    </td>
                    <td className="px-6 py-2.5">
                      <div className="flex flex-col gap-0.5 max-w-xs">
                        <p className="text-sm font-semibold text-slate-800 line-clamp-1">
                          {item.tujuan_surat}
                        </p>
                        <p className="text-xs text-slate-500 line-clamp-1 italic">
                          "{item.perihal}"
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenForm(item)}
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : !loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div
                        className={`h-12 w-12 rounded-2xl flex items-center justify-center ${fetchError ? "bg-red-50 text-red-400" : "bg-slate-50 text-slate-300"}`}
                      >
                        <FileText className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                        {fetchError
                          ? "Gagal memuat data surat"
                          : "Belum ada data surat"}
                      </p>
                      {fetchError && (
                        <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                          {fetchError}. Silakan cek koneksi internet atau coba
                          refresh halaman.
                        </p>
                      )}
                      {fetchError && (
                        <button
                          onClick={fetchData}
                          className="mt-4 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
                        >
                          Coba Lagi
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {filteredItems.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <select
                value={rowsPerPage === filteredItems.length && filteredItems.length > 0 ? "all" : rowsPerPage}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "all") {
                    setRowsPerPage(filteredItems.length > 0 ? filteredItems.length : 10);
                  } else {
                    setRowsPerPage(Number(val));
                  }
                  setCurrentPage(1);
                }}
                className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer shadow-sm"
              >
                <option value={10}>10 Baris</option>
                <option value={25}>25 Baris</option>
                <option value={50}>50 Baris</option>
                <option value={100}>100 Baris</option>
                <option value={200}>200 Baris</option>
                <option value="all">Semua Baris</option>
              </select>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Menampilkan {filteredItems.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} -{" "}
                {Math.min(currentPage * rowsPerPage, filteredItems.length)}{" "}
                dari {filteredItems.length} Surat Keluar
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all"
              >
                Sebelumnya
              </button>

              <div className="flex items-center justify-center px-2 text-xs font-medium text-slate-600">
                Hal {currentPage} / {totalPages || 1}
              </div>

              <button
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => !submitting && setShowForm(false)}
          />
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in slide-in-from-bottom-4 duration-300">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {editingId ? "Edit Surat Keluar" : "Registrasi Surat Keluar"}
                </h3>
                <p className="text-xs font-semibold text-slate-500">
                  {editingId
                    ? "Perbarui data surat di Google Sheets"
                    : "Input data surat baru ke Google Sheets"}
                </p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                disabled={submitting}
                className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5"
              onSubmit={handleSubmit}
            >
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Nomor Surat
                </label>
                <input
                  required
                  name="nomor_surat"
                  type="text"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                  placeholder="B-___/Kk.17.05/1/BA.01/__/2026"
                  value={formData.nomor_surat}
                  onChange={(e) =>
                    setFormData({ ...formData, nomor_surat: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <ModernDatePicker
                  required
                  name="tanggal_surat"
                  label="Tanggal Surat"
                  value={formData.tanggal_surat}
                  onChange={(val) =>
                    setFormData({ ...formData, tanggal_surat: val })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Jenis Agenda
                </label>
                <ModernSelect
                  name="agenda"
                  options={[
                    "Surat Dinas",
                    "Surat Keputusan",
                    "Surat Tugas",
                    "Surat Undangan",
                    "Surat Pengantar",
                    "Surat Keterangan",
                    "Surat Pernyataan",
                    "Surat Cuti",
                    "Berita Acara",
                    "Nota Dinas"
                  ]}
                  value={formData.agenda}
                  onChange={(val) => setFormData({ ...formData, agenda: val })}
                  enableSearch
                  searchPlaceholder="Cari agenda..."
                  placeholder="Pilih agenda"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Unit Kerja Pembuat
                </label>
                <ModernSelect
                  name="unit_kerja"
                  options={[
                    "Sekjend",
                    "Bimas Islam",
                    "Bimas Kristen",
                    "Pendidikan Madrasah",
                    "Pendidikan Agama Islam",
                    "Pendidikan Diniyah & Pontren",
                    "Penyelenggara Hindu",
                    "Penyelenggara Zakat & Wakaf"
                  ]}
                  value={formData.unit_kerja}
                  onChange={(val) => setFormData({ ...formData, unit_kerja: val })}
                  enableSearch
                  searchPlaceholder="Cari unit kerja..."
                  placeholder="Pilih unit kerja"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Tujuan Surat
                </label>
                <input
                  required
                  name="tujuan_surat"
                  type="text"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                  placeholder="Instansi atau perorangan penerima..."
                  value={formData.tujuan_surat}
                  onChange={(e) => {
                    const val = e.target.value;
                    const capitalized = val ? val.charAt(0).toUpperCase() + val.slice(1) : "";
                    setFormData({ ...formData, tujuan_surat: capitalized });
                  }}
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Perihal
                </label>
                <textarea
                  required
                  name="perihal"
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none resize-none"
                  placeholder="Isi ringkas perihal surat..."
                  value={formData.perihal}
                  onChange={(e) => {
                    const val = e.target.value;
                    const capitalized = val ? val.charAt(0).toUpperCase() + val.slice(1) : "";
                    setFormData({ ...formData, perihal: capitalized });
                  }}
                />
              </div>

              <div className="md:col-span-2 pt-4 flex gap-3">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-[2] px-6 py-3 bg-[#059669] text-white rounded-xl text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingId ? "Simpan Perubahan" : "Simpan & Terbitkan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => !submitting && setShowDeleteConfirm(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in slide-in-from-bottom-4 duration-300">
            <div className="p-6 text-center">
              <div className="mx-auto w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-4">
                <Trash2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-2">
                Hapus Data Surat?
              </h3>
              <p className="text-sm font-medium text-slate-500 mb-8 px-4">
                Tindakan ini tidak dapat dibatalkan. Data akan dihapus secara
                permanen dari Google Sheets.
              </p>

              <div className="flex gap-3">
                <button
                  disabled={submitting}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  disabled={submitting}
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Ya, Hapus"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
