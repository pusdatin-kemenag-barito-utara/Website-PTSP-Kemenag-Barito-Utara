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
} from "@/lib/actions/admin-persuratan";

interface SuratKeluar {
  id: string;
  nomor_surat: string;
  tanggal_surat: string;
  tujuan_surat: string;
  perihal: string;
  unit_kerja: string;
  agenda: string;
}

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

  // Delete Confirmation State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Toast Notification State
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

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
    const data = await getSuratKeluarAction();
    setItems(data);
    setLoading(false);
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.nomor_surat.toLowerCase().includes(search.toLowerCase()) ||
        item.tujuan_surat.toLowerCase().includes(search.toLowerCase()) ||
        item.perihal.toLowerCase().includes(search.toLowerCase());

      const matchesDate = filterDate ? item.tanggal_surat === filterDate : true;

      return matchesSearch && matchesDate;
    });
  }, [items, search, filterDate]);

  const handleOpenForm = (item?: SuratKeluar) => {
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
    } else {
      setFormData({
        nomor_surat: "",
        tanggal_surat: "",
        tujuan_surat: "",
        perihal: "",
        unit_kerja: "Sekjend",
        agenda: "Surat Dinas",
      });
      setEditingId(null);
    }
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;

    setSubmitting(true);
    try {
      await deleteSuratKeluarAction(deletingId);
      await fetchData();
      setShowDeleteConfirm(false);
      setDeletingId(null);
      showToast("Data surat keluar berhasil dihapus", "success");
    } catch (error) {
      showToast("Gagal menghapus data", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const form = new FormData(e.currentTarget);
      if (editingId) form.append("id", editingId);

      await saveSuratKeluarAction(form);
      await fetchData();
      setShowForm(false);
      showToast(
        editingId ? "Data berhasil diperbarui" : "Data berhasil disimpan",
        "success",
      );
    } catch (error) {
      showToast("Gagal menyimpan data", "error");
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
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm border ${
              showFilters || filterDate
                ? "bg-indigo-50 border-indigo-200 text-indigo-600"
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
              className={`h-4 w-4 ${loading ? "animate-spin text-indigo-600" : ""}`}
            />
          </button>
          <button
            onClick={() => handleOpenForm()}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1f4bb7] text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
          >
            <Plus className="h-4 w-4" />
            Buat Surat Baru
          </button>
        </div>
      </div>

      {/* Advanced Filter Panel */}
      {showFilters && (
        <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest ml-1">
              Filter Berdasarkan Tanggal Surat
            </label>
            <input
              type="date"
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={() => setFilterDate("")}
              className="flex-1 px-4 py-2 bg-white border border-slate-200 text-slate-500 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
            >
              <X className="h-3.5 w-3.5" />
              Reset Filter
            </button>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm min-h-[400px] relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-4 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider text-center w-12">
                  No
                </th>
                <th className="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Info Surat
                </th>
                <th className="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Tanggal & Agenda
                </th>
                <th className="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Unit Kerja
                </th>
                <th className="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Tujuan & Perihal
                </th>
                <th className="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-4 py-4 text-center">
                      <span className="text-xs font-bold text-slate-400">
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-sm font-bold text-slate-900">
                            {item.nomor_surat}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 ml-8 font-medium">
                          UNIT: {item.unit_kerja.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-slate-600 font-bold bg-slate-100 w-fit px-3 py-1.5 rounded-lg border border-slate-200">
                          <Calendar className="h-3.5 w-3.5 text-blue-500" />
                          <span>{item.tanggal_surat}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-indigo-600 font-extrabold bg-indigo-50 w-fit px-2.5 py-1 rounded-md border border-indigo-100 uppercase tracking-tight">
                          {item.agenda}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-extrabold border bg-indigo-50 text-indigo-600 border-indigo-100 uppercase">
                        {item.unit_kerja}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5 max-w-xs">
                        <p className="text-sm font-semibold text-slate-800 line-clamp-1">
                          {item.tujuan_surat}
                        </p>
                        <p className="text-xs text-slate-500 line-clamp-1 italic">
                          "{item.perihal}"
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
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
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                        <FileText className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                        Belum ada data surat keluar
                      </p>
                    </div>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
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
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  placeholder="B-___/Kk.17.05/1/BA.01/__/2026"
                  value={formData.nomor_surat}
                  onChange={(e) =>
                    setFormData({ ...formData, nomor_surat: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Tanggal Surat
                </label>
                <input
                  name="tanggal_surat"
                  type="date"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  value={formData.tanggal_surat}
                  onChange={(e) =>
                    setFormData({ ...formData, tanggal_surat: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Jenis Agenda
                </label>
                <select
                  name="agenda"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none appearance-none"
                  value={formData.agenda}
                  onChange={(e) =>
                    setFormData({ ...formData, agenda: e.target.value })
                  }
                >
                  <option>Surat Dinas</option>
                  <option>Surat Keputusan</option>
                  <option>Surat Tugas</option>
                  <option>Surat Undangan</option>
                  <option>Surat Pengantar</option>
                  <option>Surat Keterangan</option>
                  <option>Surat Pernyataan</option>
                  <option>Surat Cuti</option>
                  <option>Berita Acara</option>
                  <option>Nota Dinas</option>
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Unit Kerja Pembuat
                </label>
                <select
                  name="unit_kerja"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none appearance-none"
                  value={formData.unit_kerja}
                  onChange={(e) =>
                    setFormData({ ...formData, unit_kerja: e.target.value })
                  }
                >
                  <option>Sekjend</option>
                  <option>Bimas Islam</option>
                  <option>Bimas Kristen</option>
                  <option>Pendidikan Madrasah</option>
                  <option>Pendidikan Agama Islam</option>
                  <option>Penyelenggara Hindu</option>
                  <option>Penyelenggara Zakat & Wakaf</option>
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Tujuan Surat
                </label>
                <input
                  required
                  name="tujuan_surat"
                  type="text"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  placeholder="Instansi atau perorangan penerima..."
                  value={formData.tujuan_surat}
                  onChange={(e) =>
                    setFormData({ ...formData, tujuan_surat: e.target.value })
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
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none"
                  placeholder="Isi ringkas perihal surat..."
                  value={formData.perihal}
                  onChange={(e) =>
                    setFormData({ ...formData, perihal: e.target.value })
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
                  className="flex-[2] px-6 py-3 bg-[#1f4bb7] text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-8 fade-in duration-300">
          <div
            className={`px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${
              toast.type === "success"
                ? "bg-emerald-600 border-emerald-500 text-white"
                : "bg-red-600 border-red-500 text-white"
            }`}
          >
            {toast.type === "success" ? (
              <div className="p-1 bg-white/20 rounded-full">
                <ArrowUpRight className="h-4 w-4" />
              </div>
            ) : (
              <div className="p-1 bg-white/20 rounded-full">
                <X className="h-4 w-4" />
              </div>
            )}
            <span className="text-sm font-extrabold tracking-wide uppercase">
              {toast.message}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
