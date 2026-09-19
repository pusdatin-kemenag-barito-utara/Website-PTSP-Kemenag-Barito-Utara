import { useState, useTransition, useEffect, useMemo } from "react";
import { useRouter } from "@/lib/next-compat/navigation";
import {
  BadgeCheck,
  Search,
  Plus,
  Trash2,
  Pencil,
  Inbox,
  Loader2,
  Phone,
  Mail,
  Building2,
  Sparkles,
  CheckCircle2,
  UserPlus,
  X,
} from "lucide-react";
import { motion as m, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { fetchAPI } from "@/lib/api";
import { UserTablePagination } from "./user-table-pagination";
import { DeleteUserModal } from "./delete-user-modal";
import { UNIT_KERJA_OPTIONS } from "@/lib/constants";
import { ModernSelect } from "@/components/ui/modern-select";

interface PegawaiTableProps {
  pegawaiList: any[];
  viewerIsSuperAdmin: boolean;
  onPegawaiCreated: (newPegawai: any) => void;
  onPegawaiUpdated: (id: string, data: any) => void;
  onPegawaiDeleted: (id: string) => void;
}

export function PegawaiTable({
  pegawaiList,
  viewerIsSuperAdmin,
  onPegawaiCreated,
  onPegawaiUpdated,
  onPegawaiDeleted,
}: PegawaiTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [unitFilter, setUnitFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [isPending, startTransition] = useTransition();

  // Dynamic Master Options for Unit Kerja
  const [masterOptions, setMasterOptions] = useState<any[]>([]);

  useEffect(() => {
    fetchAPI<any>("/master-options")
      .then((res) => {
        if (res?.success && Array.isArray(res?.data)) {
          setMasterOptions(res.data);
        }
      })
      .catch(() => {});
  }, []);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPegawai, setEditingPegawai] = useState<any | null>(null);
  const [deletingPegawai, setDeletingPegawai] = useState<any | null>(null);

  // Form states
  const initialForm = {
    nama: "",
    nip: "",
    jabatan: "",
    pangkat_golongan: "",
    unit_kerja: "",
    no_hp: "",
    email: "",
    status: "active",
    tipe_pejabat: "",
  };
  const [formData, setFormData] = useState(initialForm);

  const unitKerjaOptions = useMemo(() => {
    const set = new Set<string>();

    // 1. Dari masterOptions API
    masterOptions
      .filter((o) => o.category === "unit_kerja" && o.is_active !== false)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      .forEach((o) => {
        if (o.label) set.add(o.label);
        else if (o.value) set.add(o.value);
      });

    // 2. Dari fallback konstanta
    UNIT_KERJA_OPTIONS.forEach((u) => {
      if (u) set.add(u);
    });

    // 3. Dari seluruh data unit_kerja pegawai yang ada di database (e.g. MAN Barito Utara, MIN 1, KUA, dll)
    if (Array.isArray(pegawaiList)) {
      pegawaiList.forEach((p) => {
        if (p.unit_kerja && typeof p.unit_kerja === "string" && p.unit_kerja.trim()) {
          set.add(p.unit_kerja.trim());
        }
      });
    }

    // 4. Pastikan unit_kerja yang sedang diedit juga selalu ada
    if (formData.unit_kerja && formData.unit_kerja.trim()) {
      set.add(formData.unit_kerja.trim());
    }

    return Array.from(set)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, "id"))
      .map((u) => ({ value: u, label: u }));
  }, [masterOptions, pegawaiList, formData.unit_kerja]);

  // Filter logic (Maximal multi-term token search across all attributes)
  const filtered = pegawaiList.filter((p) => {
    const query = searchQuery.toLowerCase().trim();
    let matchSearch = true;
    if (query) {
      const tokens = query.split(/\s+/).filter(Boolean);
      const cleanNip = (p.nip || "").replace(/\s+/g, "");
      const cleanHp = (p.no_hp || "").replace(/\D/g, "");
      const haystack = [
        p.nama || "",
        p.nip || "",
        cleanNip,
        p.jabatan || "",
        p.unit_kerja || "",
        p.pangkat_golongan || "",
        p.email || "",
        p.no_hp || "",
        cleanHp,
        p.status || "",
        p.is_cuti_synced ? "tersinkron cuti" : "belum cuti",
      ]
        .join(" ")
        .toLowerCase();

      matchSearch = tokens.every((token) => haystack.includes(token));
    }

    const matchUnit = unitFilter === "all" || p.unit_kerja === unitFilter;
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && p.status === "active") ||
      (statusFilter === "inactive" && p.status === "inactive");

    return matchSearch && matchUnit && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  // Open Create Modal
  const openCreate = () => {
    setFormData(initialForm);
    setIsAddOpen(true);
  };

  // Open Edit Modal
  const openEdit = (p: any) => {
    setEditingPegawai(p);
    setFormData({
      nama: p.nama || "",
      nip: p.nip || "",
      jabatan: p.jabatan || "",
      pangkat_golongan: p.pangkat_golongan || "",
      unit_kerja: p.unit_kerja || "",
      no_hp: p.no_hp || "",
      email: p.email || "",
      status: p.status || "active",
      tipe_pejabat: p.tipe_pejabat || "",
    });
  };

  // Save Create
  const handleSaveCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim()) {
      toast.error("Nama pegawai wajib diisi");
      return;
    }

    const toastId = toast.loading("Menambahkan pegawai baru...");
    setIsAddOpen(false);
    const addedForm = { ...formData };
    setFormData(initialForm);

    try {
      const res = await fetchAPI<any>("/admin/users/pegawai", {
        method: "POST",
        body: JSON.stringify(addedForm),
      });
      toast.dismiss(toastId);
      if (res?.success) {
        toast.success("Pegawai Berhasil Ditambahkan", {
          description: "Data otomatis disinkronkan ke tabel Sistem Manajemen Cuti.",
        });
        if (res.data) {
          onPegawaiCreated(res.data);
        }
        router.refresh();
      } else {
        toast.error("Gagal menambahkan", {
          description: res?.error || "Terjadi kesalahan",
        });
      }
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error("Kesalahan jaringan", {
        description: err.message,
      });
    }
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPegawai) return;
    const targetId = editingPegawai.id;
    setEditingPegawai(null);
    const toastId = toast.loading("Menyimpan data pegawai...");

    try {
      const res = await fetchAPI<any>(`/admin/users/pegawai/${targetId}`, {
        method: "PATCH",
        body: JSON.stringify(formData),
      });
      toast.dismiss(toastId);
      if (res?.success) {
        toast.success("Pegawai Berhasil Diperbarui", {
          description: "Perubahan data pegawai otomatis tersinkronisasi ke Manajemen Cuti.",
        });
        onPegawaiUpdated(targetId, formData);
        router.refresh();
      } else {
        toast.error("Gagal memperbarui", {
          description: res?.error || "Terjadi kesalahan",
        });
      }
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error("Kesalahan jaringan", {
        description: err.message,
      });
    }
  };

  // Delete
  const confirmDelete = async () => {
    if (!deletingPegawai) return;
    const target = deletingPegawai;
    setDeletingPegawai(null);
    const toastId = toast.loading(`Sedang menghapus data pegawai "${target.nama}"...`);

    try {
      const res = await fetchAPI<any>(`/admin/users/pegawai/${target.id}`, {
        method: "DELETE",
      });
      toast.dismiss(toastId);
      if (res?.success) {
        toast.success("Pegawai Berhasil Dihapus", {
          description: "Data pegawai telah dihapus dari sistem.",
        });
        onPegawaiDeleted(target.id);
        router.refresh();
      } else {
        toast.error("Gagal menghapus", {
          description: res?.error || "Terjadi kesalahan",
        });
      }
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error("Kesalahan jaringan", {
        description: err.message,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
      {/* Table Filter Header */}
      <div className="border-b border-slate-200/80 px-4 py-3 bg-slate-50/60 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700 shrink-0">
            <BadgeCheck className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Daftar Pegawai Kemenag ({filtered.length})
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.2 text-[9.5px] font-bold border border-emerald-200">
                <CheckCircle2 className="h-2.5 w-2.5" /> Auto-Sync Cuti
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Database seluruh ASN & Pegawai Kantor Kementerian Agama Barito Utara.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input with Clear Button */}
          <div className="relative min-w-[200px] flex-1 md:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, NIP, jabatan, unit..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-8 pr-7 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setPage(1);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                title="Hapus pencarian"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Unit Kerja Filter (ModernSelect) */}
          <div className="w-48 sm:w-56 shrink-0">
            <ModernSelect
              options={[
                { value: "all", label: "Semua Unit Kerja" },
                ...unitKerjaOptions,
              ]}
              value={unitFilter}
              onChange={(val) => {
                setUnitFilter(val);
                setPage(1);
              }}
              placeholder="Semua Unit Kerja"
              enableSearch
              searchPlaceholder="Cari unit kerja..."
              size="sm"
              menuClassName="min-w-[260px] sm:min-w-[320px]"
            />
          </div>

          {/* Status Filter (ModernSelect) */}
          <div className="w-36 shrink-0">
            <ModernSelect
              options={[
                { value: "all", label: "Semua Status" },
                { value: "active", label: "Aktif" },
                { value: "inactive", label: "Nonaktif" },
              ]}
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setPage(1);
              }}
              placeholder="Semua Status"
              size="sm"
              menuClassName="min-w-[160px]"
            />
          </div>

          {/* Tambah Pegawai Button */}
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer shrink-0"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Tambah Pegawai
          </button>
        </div>
      </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-100/50 text-[10px] font-black uppercase tracking-wider text-slate-500">
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3">Pegawai & NIP</th>
                <th className="py-2.5 px-3">Jabatan & Unit Kerja</th>
                <th className="py-2.5 px-3">Pangkat / Gol</th>
                <th className="py-2.5 px-3">Kontak Pegawai</th>
                <th className="py-2.5 px-3 text-center">Status Cuti</th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <m.tbody
              key={`page-${page}`}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.12 }}
              className="divide-y divide-slate-100"
            >
              {paginated.map((p, idx) => {
                const initial = (p.nama || "P").charAt(0).toUpperCase();

                return (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-2.5 px-3 text-center font-bold text-slate-400 tabular-nums">
                      {(page - 1) * perPage + idx + 1}
                    </td>

                    {/* Pegawai & NIP */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-xs shrink-0 shadow-2xs">
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{p.nama}</p>
                          <p className="text-[10.5px] font-mono text-slate-500 truncate mt-0.5">
                            NIP: {p.nip || <span className="italic font-sans text-slate-400">-</span>}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Jabatan & Unit Kerja */}
                    <td className="py-2.5 px-3">
                      <p className="font-bold text-slate-800 truncate">
                        {p.jabatan || <span className="text-slate-400 font-normal italic">-</span>}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5 flex items-center gap-1">
                        <Building2 className="h-2.5 w-2.5 text-slate-400 shrink-0" />
                        <span className="truncate">{p.unit_kerja || "Kemenag Barito Utara"}</span>
                      </p>
                    </td>

                    {/* Pangkat / Gol */}
                    <td className="py-2.5 px-3">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10.5px]">
                        {p.pangkat_golongan || "-"}
                      </span>
                    </td>

                    {/* Kontak */}
                    <td className="py-2.5 px-3">
                      {p.no_hp ? (
                        <p className="text-slate-700 font-medium text-[11px] flex items-center gap-1">
                          <Phone className="h-2.5 w-2.5 text-emerald-600" />
                          {p.no_hp}
                        </p>
                      ) : (
                        <span className="text-slate-400 text-[10.5px] italic">-</span>
                      )}
                      {p.email && (
                        <p className="text-slate-400 text-[10px] truncate max-w-[140px] flex items-center gap-1 mt-0.5">
                          <Mail className="h-2.5 w-2.5" />
                          {p.email}
                        </p>
                      )}
                    </td>

                    {/* Status Sinkronisasi Cuti */}
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" />
                        Tersinkron Cuti
                      </span>
                    </td>

                    {/* Aksi */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 rounded-md text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                          title="Edit Data Pegawai"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        {viewerIsSuperAdmin && (
                          <button
                            onClick={() => setDeletingPegawai(p)}
                            className="p-1.5 rounded-md text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Hapus Pegawai"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {paginated.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Inbox className="h-8 w-8 text-slate-300" />
                      <p className="text-xs font-bold text-slate-600">
                        {searchQuery || unitFilter !== "all" || statusFilter !== "all"
                          ? "Tidak ada data pegawai yang sesuai dengan filter / kata kunci."
                          : "Belum ada data pegawai."}
                      </p>
                      {(searchQuery || unitFilter !== "all" || statusFilter !== "all") && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery("");
                            setUnitFilter("all");
                            setStatusFilter("all");
                            setPage(1);
                          }}
                          className="mt-1 text-xs text-emerald-600 hover:text-emerald-700 font-bold underline cursor-pointer"
                        >
                          Reset Semua Filter
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </m.tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <UserTablePagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      {/* Modal Tambah / Edit Pegawai */}
      {(isAddOpen || editingPegawai) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-2xl sm:max-w-3xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-black text-slate-900">
                {isAddOpen ? "Tambah Pegawai Baru" : "Edit Data Pegawai"}
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[10px] font-bold border border-emerald-200">
                <Sparkles className="h-2.5 w-2.5" /> Auto-Sync Cuti
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Data pegawai ini akan otomatis disinkronkan ke tabel Manajemen Cuti instansi.
            </p>

            <form onSubmit={isAddOpen ? handleSaveCreate : handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nama Lengkap Pegawai <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  placeholder="Misal: AHMAD FAUZI, S.Pd.I"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">NIP (18 Digit)</label>
                  <input
                    type="text"
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono font-medium"
                    placeholder="1990..."
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Pangkat / Golongan</label>
                  <input
                    type="text"
                    value={formData.pangkat_golongan}
                    onChange={(e) => setFormData({ ...formData, pangkat_golongan: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium"
                    placeholder="Misal: Penata Muda (III/a)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Jabatan</label>
                <input
                  type="text"
                  value={formData.jabatan}
                  onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium"
                  placeholder="Misal: Pranata Komputer Ahli Pertama"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Unit Kerja</label>
                <ModernSelect
                  options={unitKerjaOptions}
                  value={formData.unit_kerja}
                  onChange={(val) => setFormData({ ...formData, unit_kerja: val })}
                  placeholder="Pilih Unit Kerja"
                  enableSearch
                  searchPlaceholder="Cari unit kerja..."
                  size="sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">No. WhatsApp / HP</label>
                  <input
                    type="text"
                    value={formData.no_hp}
                    onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium"
                    placeholder="08..."
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium"
                    placeholder="pegawai@kemenag.go.id"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Status Kepegawaian</label>
                  <ModernSelect
                    options={[
                      { value: "active", label: "Aktif" },
                      { value: "inactive", label: "Nonaktif" },
                    ]}
                    value={formData.status}
                    onChange={(val) => setFormData({ ...formData, status: val })}
                    placeholder="Pilih Status"
                    size="sm"
                    menuClassName="min-w-[180px]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Tipe Pejabat</label>
                  <input
                    type="text"
                    value={formData.tipe_pejabat}
                    onChange={(e) => setFormData({ ...formData, tipe_pejabat: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium"
                    placeholder="Misal: Pejabat Eselon IV (opsional)"
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setEditingPegawai(null);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                  {isAddOpen ? "Simpan Pegawai" : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteUserModal
        deletingUser={deletingPegawai}
        isPending={isPending}
        onClose={() => setDeletingPegawai(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
