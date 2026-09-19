import { useState, useMemo } from "react";
import {
  Building2,
  ShieldCheck,
  Plus,
  Search,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { fetchAPI } from "@/lib/api";

export type MasterCategory = "unit_kerja" | "role_admin";

export interface MasterOptionItem {
  id: string;
  category: string;
  value: string;
  label: string;
  sort_order: number;
  is_active: boolean;
}

interface UnitKerjaManagerProps {
  initialOptions: MasterOptionItem[];
}

const CATEGORY_CONFIG: Record<
  MasterCategory,
  {
    title: string;
    singular: string;
    desc: string;
    labelPlaceholder: string;
    valuePlaceholder: string;
    valueHint: string;
    icon: React.ElementType;
  }
> = {
  unit_kerja: {
    title: "Unit Kerja / Seksi",
    singular: "Unit Kerja",
    desc: "Struktur seksi, unit kerja, KUA, madrasah, dan sekolah di lingkungan Kemenag Barito Utara",
    labelPlaceholder: "Misal: MAN Barito Utara",
    valuePlaceholder: "MAN Barito Utara",
    valueHint: "Nama unit kerja resmi yang digunakan di formulir dan database sistem.",
    icon: Building2,
  },
  role_admin: {
    title: "Role Akses Admin",
    singular: "Role Admin",
    desc: "Daftar role akun administrator dan petugas instansi beserta label resminya",
    labelPlaceholder: "Misal: Admin Humas & Publikasi",
    valuePlaceholder: "admin_humas",
    valueHint: "Identifier role sistem (misal: admin_xxx, kepala_xxx, kasubag_xxx).",
    icon: ShieldCheck,
  },
};

export function UnitKerjaManager({ initialOptions = [] }: UnitKerjaManagerProps) {
  const [activeTab, setActiveTab] = useState<MasterCategory>("unit_kerja");
  const [options, setOptions] = useState<MasterOptionItem[]>(initialOptions);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterOptionItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<MasterOptionItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    label: "",
    value: "",
    sort_order: 1,
    is_active: true,
  });

  const currentConfig = CATEGORY_CONFIG[activeTab];

  // Filter items by active tab and search query
  const filteredItems = useMemo(() => {
    return options
      .filter((opt) => opt.category === activeTab)
      .filter((opt) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          opt.label.toLowerCase().includes(q) ||
          opt.value.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [options, activeTab, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const currentCategory = options.filter((o) => o.category === activeTab);
    return {
      total: currentCategory.length,
      active: currentCategory.filter((o) => o.is_active).length,
      inactive: currentCategory.filter((o) => !o.is_active).length,
    };
  }, [options, activeTab]);

  // Open Add Modal
  const handleOpenAdd = () => {
    const currentCategory = options.filter((o) => o.category === activeTab);
    const nextOrder =
      currentCategory.length > 0
        ? Math.max(...currentCategory.map((o) => o.sort_order || 0)) + 1
        : 1;

    setFormData({
      label: "",
      value: "",
      sort_order: nextOrder,
      is_active: true,
    });
    setIsAddOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: MasterOptionItem) => {
    setEditingItem(item);
    setFormData({
      label: item.label,
      value: item.value,
      sort_order: item.sort_order,
      is_active: item.is_active,
    });
  };

  // Auto-generate value slug from label if creating new
  const handleLabelChange = (newLabel: string) => {
    if (!editingItem) {
      const generatedValue =
        activeTab === "unit_kerja"
          ? newLabel
          : newLabel
              .toLowerCase()
              .trim()
              .replace(/[^a-z0-9]+/g, "_")
              .replace(/^_+|_+$/g, "");
      setFormData((prev) => ({
        ...prev,
        label: newLabel,
        value: generatedValue,
      }));
    } else {
      setFormData((prev) => ({ ...prev, label: newLabel }));
    }
  };

  // Sync unit kerja from pegawai data
  const handleSyncFromPegawai = async () => {
    setIsSyncing(true);
    const toastId = toast.loading("Menyinkronkan data unit kerja dari data pegawai...");
    try {
      const res = await fetchAPI<any>("/admin/master-options/sync-unit-kerja", {
        method: "POST",
      });
      if (res?.success) {
        toast.success("Sinkronisasi Berhasil", {
          id: toastId,
          description: res.message || "Data unit kerja berhasil disinkronkan ke database.",
        });
        // Reload master options
        const refreshRes = await fetchAPI<any>("/master-options");
        if (refreshRes?.success && Array.isArray(refreshRes.data)) {
          setOptions(refreshRes.data);
        }
      } else {
        toast.error("Gagal sinkronisasi", {
          id: toastId,
          description: res?.error || "Terjadi kesalahan saat menyinkronkan data.",
        });
      }
    } catch (err: any) {
      toast.error("Kesalahan jaringan", {
        id: toastId,
        description: err.message,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Save (Create or Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.label.trim()) {
      toast.error("Nama / Label wajib diisi");
      return;
    }

    if (!formData.value.trim()) {
      toast.error("Kode sistem (value) wajib diisi");
      return;
    }

    const toastId = toast.loading(
      editingItem ? "Menyimpan perubahan data..." : "Menambahkan data baru..."
    );
    const isEdit = !!editingItem;
    const targetId = editingItem?.id;
    setIsAddOpen(false);
    setEditingItem(null);
    setIsPending(true);

    try {
      const payload = {
        id: isEdit ? targetId : undefined,
        category: activeTab,
        label: formData.label.trim(),
        value: formData.value.trim(),
        sortOrder: Number(formData.sort_order) || 1,
        isActive: formData.is_active,
      };

      const res = await fetchAPI<any>("/admin/master-options", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res?.success && res.data) {
        if (isEdit) {
          setOptions((prev) =>
            prev.map((item) => (item.id === res.data.id ? res.data : item))
          );
          toast.success("Berhasil Memperbarui Data", {
            id: toastId,
            description: `Data "${res.data.label}" telah disimpan.`,
          });
        } else {
          setOptions((prev) => [...prev, res.data]);
          toast.success("Berhasil Menambahkan Data", {
            id: toastId,
            description: `Data "${res.data.label}" telah ditambahkan ke sistem.`,
          });
        }
      } else {
        toast.error("Gagal menyimpan", {
          id: toastId,
          description: res?.error || "Terjadi kesalahan saat menyimpan data.",
        });
      }
    } catch (err: any) {
      toast.error("Kesalahan jaringan", {
        id: toastId,
        description: err.message,
      });
    } finally {
      setIsPending(false);
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!deletingItem) return;
    const target = deletingItem;
    setDeletingItem(null);
    setIsPending(true);
    const toastId = toast.loading(`Sedang menghapus "${target.label}"...`);

    try {
      const res = await fetchAPI<any>(`/admin/master-options/${target.id}`, {
        method: "DELETE",
      });

      if (res?.success) {
        setOptions((prev) => prev.filter((item) => item.id !== target.id));
        toast.success("Berhasil Dihapus", {
          id: toastId,
          description: `Data "${target.label}" telah berhasil dihapus dari sistem.`,
        });
      } else {
        toast.error("Gagal menghapus", {
          id: toastId,
          description: res?.error || "Terjadi kesalahan saat menghapus data.",
        });
      }
    } catch (err: any) {
      toast.error("Kesalahan jaringan", {
        id: toastId,
        description: err.message,
      });
    } finally {
      setIsPending(false);
    }
  };

  // Quick toggle active state
  const handleToggleActive = async (item: MasterOptionItem) => {
    const nextStatus = !item.is_active;
    const toastId = toast.loading(`Mengubah status "${item.label}"...`);

    try {
      const payload = {
        id: item.id,
        category: item.category,
        label: item.label,
        value: item.value,
        sortOrder: item.sort_order,
        isActive: nextStatus,
      };

      const res = await fetchAPI<any>("/admin/master-options", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res?.success && res.data) {
        setOptions((prev) =>
          prev.map((opt) => (opt.id === item.id ? res.data : opt))
        );
        toast.success(
          nextStatus ? "Status Diaktifkan" : "Status Dinonaktifkan",
          {
            id: toastId,
            description: `Status "${item.label}" sekarang ${nextStatus ? "Aktif" : "Nonaktif"}.`,
          },
        );
      } else {
        toast.error("Gagal mengubah status", {
          id: toastId,
          description: res?.error || "Terjadi kesalahan",
        });
      }
    } catch (err: any) {
      toast.error("Gagal mengubah status", {
        id: toastId,
        description: err.message,
      });
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Tab Navigasi & Toolbar Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
        {/* 4 Tabs Menu */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60 w-fit">
          {(Object.keys(CATEGORY_CONFIG) as MasterCategory[]).map((cat) => {
            const cfg = CATEGORY_CONFIG[cat];
            const Icon = cfg.icon;
            const isActive = activeTab === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setActiveTab(cat);
                  setSearchQuery("");
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-white text-emerald-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{cfg.title}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Action Buttons */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Cari ${currentConfig.singular.toLowerCase()}...`}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          {activeTab === "unit_kerja" && (
            <button
              type="button"
              onClick={handleSyncFromPegawai}
              disabled={isSyncing || isPending}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer shrink-0 disabled:opacity-50"
              title="Sinkronkan unit kerja yang ada di data pegawai ke master options database"
            >
              <Sparkles className={`h-3.5 w-3.5 text-amber-500 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Menyinkronkan..." : "Sinkron dari Pegawai"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tambah {currentConfig.singular}</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total {currentConfig.singular}
            </p>
            <p className="text-xl font-black text-slate-900 mt-0.5">{stats.total}</p>
          </div>
          <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <currentConfig.icon className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
              Status Aktif
            </p>
            <p className="text-xl font-black text-emerald-700 mt-0.5">{stats.active}</p>
          </div>
          <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Nonaktif
            </p>
            <p className="text-xl font-black text-slate-500 mt-0.5">{stats.inactive}</p>
          </div>
          <div className="h-9 w-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
            <XCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Table Container (Full Width) */}
      <div className="w-full bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 w-1/3">Nama / Label</th>
                <th className="py-3 px-4 w-1/4">Kode Sistem (Value)</th>
                <th className="py-3 px-4 w-28 text-center">Urutan</th>
                <th className="py-3 px-4 w-32 text-center">Status</th>
                <th className="py-3 px-4 w-28 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/60 transition-colors group"
                  >
                    <td className="py-3 px-4 text-center font-bold text-slate-400">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800 flex items-center gap-2">
                        <currentConfig.icon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{item.label}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <code className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[11px] border border-slate-200/60">
                        {item.value}
                      </code>
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-slate-700">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                        <ArrowUpDown className="h-2.5 w-2.5" />
                        {item.sort_order}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(item)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                          item.is_active
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                        }`}
                        title="Klik untuk mengubah status"
                      >
                        {item.is_active ? (
                          <>
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Aktif
                          </>
                        ) : (
                          <>
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            Nonaktif
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingItem(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 italic">
                    {searchQuery
                      ? "Tidak ada data yang sesuai dengan pencarian."
                      : `Belum ada data pada kategori ${currentConfig.title}.`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah / Edit */}
      {(isAddOpen || editingItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-2xl sm:max-w-3xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  {editingItem ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    {editingItem
                      ? `Edit ${currentConfig.singular}`
                      : `Tambah ${currentConfig.singular}`}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {currentConfig.desc}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingItem(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-base font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama / Label <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.label}
                  onChange={(e) => handleLabelChange(e.target.value)}
                  placeholder={currentConfig.labelPlaceholder}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kode Sistem (Value) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder={currentConfig.valuePlaceholder}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  {currentConfig.valueHint}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Urutan Tampil
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.sort_order}
                    onChange={(e) =>
                      setFormData({ ...formData, sort_order: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="inline-flex items-center gap-2 cursor-pointer pb-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData({ ...formData, is_active: e.target.checked })
                      }
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    />
                    <span className="text-xs font-bold text-slate-700">Aktifkan Data</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
                >
                  {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{editingItem ? "Simpan Perubahan" : "Tambah Data"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 mb-3">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-black text-slate-900">Hapus Data Master?</h3>
            <p className="text-xs text-slate-500 mt-1">
              Apakah Anda yakin ingin menghapus <strong>"{deletingItem.label}"</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex items-center justify-center gap-2 mt-5">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
              >
                {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
