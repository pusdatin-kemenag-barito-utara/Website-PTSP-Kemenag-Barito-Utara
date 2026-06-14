"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  Search,
  Plus,
  Filter,
  Edit2,
  Trash2,
  Calendar,
  FileText,
  ArrowDownLeft,
  X,
  Loader2,
  Eye,
  Download,
} from "lucide-react";
import {
  getSuratMasukAction,
  saveSuratMasukAction,
  deleteSuratMasukAction,
  getNextNomorSuratSuggestionAction,
} from "@/lib/actions/admin/admin-persuratan";
import { ModernDatePicker } from "@/components/ui/modern-date-picker";
import { m, AnimatePresence } from "framer-motion";
import { ModernSelect } from "@/components/ui/modern-select";
import { toTitleCase } from "@/lib/utils";
import { toast } from "sonner";

interface SuratMasuk {
  id: string;
  nomor_surat: string;
  tanggal_surat: string;
  tanggal_terima: string;
  asal_surat: string;
  perihal: string;
  agenda?: string;
  status?: string;
  lampiran?: string;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

export function SuratMasukManager({
  initialData = [],
  initialTotal = 0,
}: {
  initialData?: any[];
  initialTotal?: number;
}) {
  const [items, setItems] = useState<SuratMasuk[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Filter States
  const [filterDateSurat, setFilterDateSurat] = useState("");
  const [filterDateTerima, setFilterDateTerima] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [fetchError, setFetchError] = useState<string | null>(null);

  // Delete Confirmation State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Detail View State
  const [detailItem, setDetailItem] = useState<SuratMasuk | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    nomor_surat: "",
    tanggal_surat: "",
    tanggal_terima: "",
    asal_surat: "",
    perihal: "",
    agenda: "",
  });

  const formInitialRef = useRef<string>("");
  const isFormDirty = useMemo(() => {
    if (!showForm) return false;
    return JSON.stringify(formData) !== formInitialRef.current;
  }, [formData, showForm]);

  useEffect(() => {
    if (showForm) {
      formInitialRef.current = JSON.stringify(formData);
    }
  }, [showForm]);

  useEffect(() => {
    if (!showForm || !isFormDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [showForm, isFormDirty]);

  const fetchData = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setFetchError(null);
    const result = await getSuratMasukAction();
    if (result.success) {
      setItems(result.data || []);
    } else {
      setFetchError(result.error || "Gagal mengambil data surat masuk.");
    }
    if (showLoading) setLoading(false);
  };

  const filteredItems = useMemo(() => {
    return items.filter((item: any) => {
      const matchesSearch =
        item.nomor_surat
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase()) ||
        item.asal_surat.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        item.perihal.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchesDateSurat = (() => {
        if (!filterDateSurat) return true;
        const itemDateStr = item.tanggal_surat?.trim();
        if (!itemDateStr) return false;
        if (itemDateStr === filterDateSurat.trim()) return true;
        try {
          const d1 = new Date(itemDateStr).getTime();
          const d2 = new Date(filterDateSurat).getTime();
          return !isNaN(d1) && !isNaN(d2) && d1 === d2;
        } catch {
          return false;
        }
      })();

      const matchesDateTerima = (() => {
        if (!filterDateTerima) return true;
        const itemDateStr = item.tanggal_terima?.trim();
        if (!itemDateStr) return false;
        if (itemDateStr === filterDateTerima.trim()) return true;
        try {
          const d1 = new Date(itemDateStr).getTime();
          const d2 = new Date(filterDateTerima).getTime();
          return !isNaN(d1) && !isNaN(d2) && d1 === d2;
        } catch {
          return false;
        }
      })();

      return matchesSearch && matchesDateSurat && matchesDateTerima;
    });
  }, [items, debouncedSearch, filterDateSurat, filterDateTerima]);

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filterDateSurat, filterDateTerima]);

  const totalPages = Math.ceil(filteredItems.length / rowsPerPage);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredItems.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredItems, currentPage, rowsPerPage]);

  const handleOpenForm = async (item?: SuratMasuk) => {
    if (item) {
      setFormData({
        nomor_surat: item.nomor_surat,
        tanggal_surat: item.tanggal_surat,
        tanggal_terima: item.tanggal_terima,
        asal_surat: item.asal_surat,
        perihal: item.perihal,
        agenda: item.agenda || "",
      });
      setEditingId(item.id);
      setShowForm(true);
    } else {
      const today = new Date().toISOString().split("T")[0];
      setFormData({
        nomor_surat: "",
        tanggal_surat: today,
        tanggal_terima: today,
        asal_surat: "",
        perihal: "",
        agenda: "",
      });
      setEditingId(null);
      setShowForm(true);

      // Suggest next number (Disabled as requested)
      // const suggestion = await getNextNomorSuratSuggestionAction("MASUK");
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
      const result = await deleteSuratMasukAction(deletingId);
      if (result.success) {
        toast.success(result.message || "Data surat berhasil dihapus");
        setShowDeleteConfirm(false);
        setDeletingId(null);
        fetchData(false);
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

      const result = await saveSuratMasukAction(form);

      if (result.success) {
        toast.success(result.message || "Data berhasil disimpan");
        setShowForm(false);
        fetchData();
      } else {
        toast.error(result.error || "Gagal menyimpan data");
      }
    } catch (error) {
      toast.error("Gagal menyimpan data");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    if (filteredItems.length === 0) {
      toast.warning("Tidak ada data untuk diekspor");
      return;
    }

    const headers = [
      "ID",
      "Nomor Surat",
      "Tanggal Surat",
      "Tanggal Terima",
      "Asal Surat",
      "Perihal",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredItems.map((e) =>
        [
          e.id,
          `"${e.nomor_surat.replace(/"/g, '""')}"`,
          `"${e.tanggal_surat}"`,
          `"${e.tanggal_terima}"`,
          `"${e.asal_surat.replace(/"/g, '""')}"`,
          `"${e.perihal.replace(/"/g, '""')}"`,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Surat_Masuk_Export_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Ekspor Berhasil", {
      description: `${filteredItems.length} data surat masuk berhasil diunduh sebagai file CSV.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nomor surat, asal, atau perihal..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm border ${
              showFilters || filterDateSurat || filterDateTerima
                ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Filter className="h-4 w-4" />
            Filter {filterDateSurat || filterDateTerima ? "(Aktif)" : ""}
          </button>
          <button
            disabled={loading}
            onClick={handleExportCSV}
            className="flex items-center justify-center p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
            title="Ekspor CSV"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            disabled={loading}
            onClick={() => fetchData(true)}
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
            Tambah Surat
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
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4 mb-1">
              <div className="space-y-1.5">
                <ModernDatePicker
                  label="Filter Tgl Surat"
                  value={filterDateSurat}
                  onChange={(val) => setFilterDateSurat(val)}
                />
              </div>
              <div className="space-y-1.5">
                <ModernDatePicker
                  label="Filter Tgl Terima"
                  value={filterDateTerima}
                  onChange={(val) => setFilterDateTerima(val)}
                />
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={() => {
                    setFilterDateSurat("");
                    setFilterDateTerima("");
                  }}
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
                  Tgl Surat
                </th>
                <th className="px-6 py-2.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Tgl Terima
                </th>
                <th className="px-6 py-2.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Asal & Perihal
                </th>
                <th className="px-6 py-2.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider text-center">
                  Status
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
                            <ArrowDownLeft className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-xs font-bold text-slate-900">
                            {item.nomor_surat}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 ml-8 font-medium">
                          REF: {item.id}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-2.5">
                      <div className="flex items-center gap-2 text-xs text-slate-700 font-bold bg-slate-100 w-fit px-3 py-1.5 rounded-lg border border-slate-200">
                        <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                        <span>{formatDate(item.tanggal_surat)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-2.5">
                      <div className="flex items-center gap-2 text-xs text-slate-700 font-bold bg-emerald-50 w-fit px-3 py-1.5 rounded-lg border border-emerald-100">
                        <FileText className="h-3.5 w-3.5 text-emerald-600" />
                        <span>{formatDate(item.tanggal_terima)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-2.5">
                      <div className="flex flex-col gap-0.5 max-w-xs">
                        <p
                          className="text-xs font-semibold text-slate-800 line-clamp-1"
                          title={item.asal_surat}
                        >
                          {item.asal_surat}
                        </p>
                        <p
                          className="text-xs text-slate-500 line-clamp-1 italic"
                          title={item.perihal}
                        >
                          "{item.perihal}"
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-2.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-extrabold border uppercase ${
                          item.status === "archived"
                            ? "bg-slate-50 text-slate-500 border-slate-200"
                            : item.status === "draft"
                              ? "bg-amber-50 text-amber-600 border-amber-200"
                              : "bg-emerald-50 text-emerald-600 border-emerald-200"
                        }`}
                      >
                        {item.status === "archived"
                          ? "Arsip"
                          : item.status === "draft"
                            ? "Draf"
                            : "Terbit"}
                      </span>
                    </td>
                    <td className="px-6 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setDetailItem(item)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Lihat Detail"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
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
                        className={`h-12 w-12 rounded-2xl flex items-center justify-center ${fetchError ? "bg-red-50 text-red-400" : debouncedSearch ? "bg-amber-50 text-amber-400" : "bg-slate-50 text-slate-300"}`}
                      >
                        <FileText className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                        {fetchError
                          ? "Gagal memuat data surat"
                          : debouncedSearch
                            ? "Pencarian tidak ditemukan"
                            : "Belum ada data surat"}
                      </p>
                      {fetchError && (
                        <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                          {fetchError}. Silakan cek koneksi internet atau coba
                          refresh halaman.
                        </p>
                      )}
                      {debouncedSearch && !fetchError && (
                        <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                          Tidak ada surat masuk yang cocok dengan kata kunci "
                          {debouncedSearch}".
                        </p>
                      )}
                      {fetchError && (
                        <button
                          onClick={() => fetchData(true)}
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
                value={
                  rowsPerPage === filteredItems.length &&
                  filteredItems.length > 0
                    ? "all"
                    : rowsPerPage
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "all") {
                    setRowsPerPage(
                      filteredItems.length > 0 ? filteredItems.length : 10,
                    );
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
                Menampilkan{" "}
                {filteredItems.length === 0
                  ? 0
                  : (currentPage - 1) * rowsPerPage + 1}{" "}
                - {Math.min(currentPage * rowsPerPage, filteredItems.length)}{" "}
                dari {filteredItems.length} Surat Masuk
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
                  {editingId ? "Edit Surat Masuk" : "Registrasi Surat Masuk"}
                </h3>
                <p className="text-xs font-semibold text-slate-500">
                  {editingId
                    ? "Perbarui data surat di sistem"
                    : "Input data surat baru ke sistem"}
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
                  placeholder="Masukkan nomor surat resmi..."
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
                <ModernDatePicker
                  required
                  name="tanggal_terima"
                  label="Tanggal Terima"
                  value={formData.tanggal_terima}
                  onChange={(val) =>
                    setFormData({ ...formData, tanggal_terima: val })
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
                    "Nota Dinas",
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
                  Asal Surat
                </label>
                <input
                  required
                  name="asal_surat"
                  type="text"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                  placeholder="Instansi atau perorangan pengirim..."
                  value={formData.asal_surat}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ ...formData, asal_surat: val });
                  }}
                  onBlur={() =>
                    setFormData((prev) => ({
                      ...prev,
                      asal_surat: toTitleCase(prev.asal_surat),
                    }))
                  }
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
                    setFormData({ ...formData, perihal: val });
                  }}
                  onBlur={() =>
                    setFormData((prev) => ({
                      ...prev,
                      perihal: toTitleCase(prev.perihal),
                    }))
                  }
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
                  {editingId ? "Simpan Perubahan" : "Simpan Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail View Modal */}
      {detailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setDetailItem(null)}
          />
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in slide-in-from-bottom-4 duration-300">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Detail Surat Masuk
                </h3>
                <p className="text-xs font-semibold text-slate-500">
                  Informasi lengkap surat masuk
                </p>
              </div>
              <button
                onClick={() => setDetailItem(null)}
                className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Nomor Surat
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {detailItem.nomor_surat}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Status
                  </p>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-extrabold border uppercase ${
                      detailItem.status === "archived"
                        ? "bg-slate-50 text-slate-500 border-slate-200"
                        : detailItem.status === "draft"
                          ? "bg-amber-50 text-amber-600 border-amber-200"
                          : "bg-emerald-50 text-emerald-600 border-emerald-200"
                    }`}
                  >
                    {detailItem.status === "archived"
                      ? "Arsip"
                      : detailItem.status === "draft"
                        ? "Draf"
                        : "Terbit"}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Tanggal Surat
                  </p>
                  <p className="text-sm font-semibold text-slate-700">
                    {formatDate(detailItem.tanggal_surat)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Tanggal Terima
                  </p>
                  <p className="text-sm font-semibold text-slate-700">
                    {formatDate(detailItem.tanggal_terima)}
                  </p>
                </div>
                {detailItem.agenda && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Jenis Agenda
                    </p>
                    <p className="text-sm font-semibold text-slate-700">
                      {detailItem.agenda}
                    </p>
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Referensi
                  </p>
                  <p className="text-sm font-semibold text-slate-700 font-mono text-xs">
                    {detailItem.id}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Asal Surat
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {detailItem.asal_surat}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Perihal
                </p>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {detailItem.perihal}
                </p>
              </div>
              {detailItem.lampiran && (
                <div className="space-y-1">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Lampiran
                  </p>
                  <p className="text-sm font-semibold text-slate-700">
                    {detailItem.lampiran}
                  </p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30 flex justify-end">
              <button
                onClick={() => setDetailItem(null)}
                className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

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
                permanen dari database.
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
