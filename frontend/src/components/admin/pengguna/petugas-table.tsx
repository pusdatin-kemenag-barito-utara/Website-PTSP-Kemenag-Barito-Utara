import { useState, useTransition, Fragment, useMemo, useEffect } from "react";
import {
  Search,
  Shield,
  ShieldCheck,
  UserCheck,
  UserX,
  Key,
  KeyRound,
  Pencil,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Eye,
  EyeOff,
  UserPlus,
  Loader2,
  Inbox,
  Building2,
} from "lucide-react";
import { motion as m, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { fetchAPI } from "@/lib/api";
import { RoleBadge } from "./role-badge";
import { UserTablePagination } from "./user-table-pagination";
import { DeleteUserModal } from "./delete-user-modal";
import { UNIT_KERJA_OPTIONS } from "@/lib/constants";
import { ModernSelect } from "@/components/ui/modern-select";

interface PetugasTableProps {
  petugasList: any[];
  viewerIsSuperAdmin: boolean;
  onPetugasCreated?: (newPetugas: any) => void;
  onPetugasUpdated: (id: string, data: any) => void;
  onPetugasDeleted: (id: string) => void;
  onOpenPermissions: (user: any) => void;
}

export function PetugasTable({
  petugasList,
  viewerIsSuperAdmin,
  onPetugasCreated,
  onPetugasUpdated,
  onPetugasDeleted,
  onOpenPermissions,
}: PetugasTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [isPending, startTransition] = useTransition();

  // Dynamic Master Options (Unit Kerja & Role Admin)
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

  // Dynamic unit kerja options
  const unitKerjaOptions = useMemo(() => {
    const fromApi = masterOptions
      .filter((o) => o.category === "unit_kerja" && o.is_active !== false)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      .map((o) => ({ value: o.value || o.label, label: o.label }));
    if (fromApi.length > 0) return fromApi;
    return UNIT_KERJA_OPTIONS.map((u) => ({ value: u, label: u }));
  }, [masterOptions]);

  // Dynamic role options
  const roleOptions = useMemo(() => {
    const fromApi = masterOptions
      .filter((o) => o.category === "role_admin" && o.is_active !== false)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      .map((o) => ({ value: o.value, label: o.label }));
    if (fromApi.length > 0) return fromApi;
    return [
      { value: "admin_ptsp", label: "Admin PTSP (Front Office)" },
      { value: "admin_sub_bagian_tata_usaha", label: "Admin Subbag Tata Usaha" },
      { value: "admin_pendidikan_madrasah", label: "Admin Pendidikan Madrasah" },
      { value: "admin_pendidikan_agama_islam", label: "Admin Pendidikan Agama Islam" },
      { value: "admin_pendidikan_diniyah_pondok_pesantren", label: "Admin PD Pontren" },
      { value: "admin_bimbingan_masyarakat_islam", label: "Admin Bimas Islam" },
      { value: "admin_bimbingan_masyarakat_kristen_katolik", label: "Admin Bimas Kristen & Katolik" },
      { value: "admin_penyelenggara_zakat_wakaf", label: "Admin Penyelenggara Zakat Wakaf" },
      { value: "admin_penyelenggara_hindu", label: "Admin Penyelenggara Hindu" },
      { value: "kasubag_tu", label: "Kasubag TU" },
      { value: "kepala_kantor", label: "Kepala Kantor" },
      { value: "super_admin", label: "Super Administrator" },
    ];
  }, [masterOptions]);

  // Modals
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [deletingUser, setDeletingUser] = useState<any | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form tambah petugas
  const initialAddForm = {
    nama: "",
    email: "",
    no_hp: "",
    nip: "",
    unit_kerja: "",
    jabatan: "",
    role: "admin_ptsp",
    password: "",
    is_verified: true,
  };
  const [addForm, setAddForm] = useState(initialAddForm);
  const [editForm, setEditForm] = useState({
    nama: "",
    nip: "",
    jabatan: "",
    unit_kerja: "",
    role: "",
    status: "",
    no_hp: "",
  });

  // Helper for role labels in search
  const roleLabels: Record<string, string> = {
    admin_ptsp: "Admin PTSP Front Office Umum",
    kasubag_tu: "Kasubag TU Subbag Tata Usaha",
    kepala_kantor: "Kepala Kantor Kankemenag",
    admin_sub_bagian_tata_usaha: "Admin Sub Bagian TU Tata Usaha",
    admin_pendidikan_madrasah: "Admin Pendidikan Madrasah Penmad",
    admin_pendidikan_agama_islam: "Admin Pendidikan Agama Islam PAI",
    admin_pendidikan_diniyah_pondok_pesantren: "Admin PD Pontren Pesantren",
    admin_bimbingan_masyarakat_islam: "Admin Bimbingan Masyarakat Islam Bimas",
    admin_bimbingan_masyarakat_kristen_katolik: "Admin Bimas Kristen Katolik",
    admin_penyelenggara_zakat_wakaf: "Admin Penyelenggara Zakat Wakaf Zawa",
    admin_penyelenggara_hindu: "Admin Penyelenggara Hindu",
    super_admin: "Super Administrator Super Admin",
  };

  // Filter list (Maximal multi-term token search across all attributes)
  const filtered = petugasList.filter((u) => {
    const query = searchQuery.toLowerCase().trim();
    let matchSearch = true;
    if (query) {
      const tokens = query.split(/\s+/).filter(Boolean);
      const cleanNip = (u.nip || "").replace(/\s+/g, "");
      const cleanHp = (u.no_hp || u.phone || "").replace(/\D/g, "");
      const roleText = roleLabels[u.role] || u.role || "";
      const statusText = u.is_verified || u.isVerified ? "terverifikasi verified" : "menunggu pending belum verifikasi";

      const haystack = [
        u.nama || u.name || "",
        u.email || "",
        u.nip || "",
        cleanNip,
        u.jabatan || "",
        u.unit_kerja || "",
        u.role || "",
        roleText,
        u.no_hp || u.phone || "",
        cleanHp,
        u.status || "",
        statusText,
      ]
        .join(" ")
        .toLowerCase();

      matchSearch = tokens.every((token) => haystack.includes(token));
    }

    const matchRole = roleFilter === "all" || u.role === roleFilter;

    let matchStatus = true;
    if (statusFilter === "pending") {
      matchStatus = u.is_verified === false || u.isVerified === false;
    } else if (statusFilter === "verified") {
      matchStatus = u.is_verified === true || u.isVerified === true;
    } else if (statusFilter === "active") {
      matchStatus = u.status === "active";
    } else if (statusFilter === "inactive") {
      matchStatus = u.status === "inactive";
    }

    return matchSearch && matchRole && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  // Handle verify / approve
  const handleVerify = async (petugas: any) => {
    const toastId = toast.loading(`Memverifikasi petugas ${petugas.nama || petugas.name}...`);
    try {
      const res = await fetchAPI<any>(`/admin/users/petugas/${petugas.id}/verify`, {
        method: "POST",
      });
      toast.dismiss(toastId);
      if (res?.success) {
        toast.success("Petugas Berhasil Diverifikasi", {
          description: `${petugas.nama || petugas.name} sekarang dapat mengakses menu panel admin.`,
        });
        onPetugasUpdated(petugas.id, { is_verified: true, isVerified: true, status: "active" });
      } else {
        toast.error("Gagal verifikasi", {
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

  // Open edit modal
  const openEdit = (p: any) => {
    setEditingUser(p);
    setEditForm({
      nama: p.nama || p.name || "",
      nip: p.nip || "",
      jabatan: p.jabatan || "",
      unit_kerja: p.unit_kerja || "",
      role: p.role || "admin_ptsp",
      status: p.status || "active",
      no_hp: p.no_hp || p.phone || "",
    });
  };

  const handleSaveAddPetugas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.nama.trim()) {
      toast.error("Nama lengkap petugas wajib diisi");
      return;
    }
    if (!addForm.email.trim()) {
      toast.error("Email login petugas wajib diisi");
      return;
    }
    if (!addForm.password || addForm.password.length < 8) {
      toast.error("Password minimal 8 karakter");
      return;
    }

    const toastId = toast.loading("Menambahkan petugas baru...");
    setIsAddModalOpen(false);
    const addedName = addForm.nama;
    setAddForm(initialAddForm);

    try {
      const res = await fetchAPI<any>("/admin/users/petugas", {
        method: "POST",
        body: JSON.stringify(addForm),
      });
      toast.dismiss(toastId);
      if (res?.success) {
        toast.success("Petugas Berhasil Ditambahkan", {
          description: `Akun ${addedName} telah aktif sebagai petugas admin.`,
        });
        if (res.data && onPetugasCreated) {
          onPetugasCreated(res.data);
        }
      } else {
        toast.error("Gagal menambahkan petugas", {
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

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const targetId = editingUser.id;
    setEditingUser(null);
    const toastId = toast.loading("Menyimpan perubahan data petugas...");

    try {
      const res = await fetchAPI<any>(`/admin/users/petugas/${targetId}`, {
        method: "PATCH",
        body: JSON.stringify(editForm),
      });
      toast.dismiss(toastId);
      if (res?.success) {
        toast.success("Petugas Berhasil Diperbarui", {
          description: "Informasi akun admin telah disimpan.",
        });
        onPetugasUpdated(targetId, editForm);
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

  // Handle delete
  const confirmDelete = async () => {
    if (!deletingUser) return;
    const target = deletingUser;
    setDeletingUser(null);
    const toastId = toast.loading(`Sedang menghapus akun ${target.fullName || target.email}...`);

    try {
      const res = await fetchAPI<any>(`/admin/users/petugas/${target.id}`, {
        method: "DELETE",
      });
      toast.dismiss(toastId);
      if (res?.success) {
        toast.success("Petugas Berhasil Dihapus", {
          description: "Akun login petugas telah dicabut dari sistem.",
        });
        onPetugasDeleted(target.id);
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

  const pendingCount = petugasList.filter(
    (u) => u.is_verified === false || u.isVerified === false
  ).length;

  return (
    <div className="space-y-3">
      {/* Alert if pending verifications */}
      {pendingCount > 0 && (
        <div className="rounded-xl border border-amber-300/80 bg-amber-50/70 px-3.5 py-2.5 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <p className="text-xs font-bold text-amber-900">
              Ada {pendingCount} akun petugas admin baru menunggu verifikasi persetujuan.
            </p>
          </div>
          <button
            onClick={() => setStatusFilter("pending")}
            className="shrink-0 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-2xs cursor-pointer transition-colors"
          >
            Tampilkan Yang Perlu Verifikasi
          </button>
        </div>
      )}

      {/* Main Table Card */}
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        {/* Table Filter Header */}
        <div className="border-b border-slate-200/80 px-4 py-3 bg-slate-50/60 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Manajemen Petugas Admin ({filtered.length})
              </h3>
              <p className="text-[11px] text-slate-400">
                Kelola akun petugas, role akses, status verifikasi, dan hak perizinan menu.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input with Clear Button */}
            <div className="relative min-w-[200px] flex-1 md:w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama, email, NIP, role..."
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

            {/* Status Filter (ModernSelect) */}
            <div className="w-44 sm:w-48 shrink-0">
              <ModernSelect
                options={[
                  { value: "all", label: "Semua Status" },
                  { value: "pending", label: "Menunggu Verifikasi" },
                  { value: "verified", label: "Terverifikasi" },
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
                align="right"
                menuClassName="min-w-[180px]"
              />
            </div>

            {/* Kelola Unit Kerja & Role Button */}
            <a
              href="/admin/kepegawaian/unit-kerja"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/90 text-slate-700 text-xs font-bold transition-all cursor-pointer shrink-0 border border-slate-200/80"
              title="Kelola data master Unit Kerja dan Role Akses secara dinamis"
            >
              <Building2 className="h-3.5 w-3.5 text-slate-500" />
              <span>Kelola Unit Kerja & Role</span>
            </a>

            {/* Tambah Petugas Button */}
            <button
              type="button"
              onClick={() => {
                setAddForm(initialAddForm);
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer shrink-0"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Tambah Petugas
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-100/50 text-[10px] font-black uppercase tracking-wider text-slate-500">
                <th className="py-2.5 px-3 w-12 text-center">#</th>
                <th className="py-2.5 px-3 w-[28%]">Petugas & Akun</th>
                <th className="py-2.5 px-3 w-[26%]">Jabatan & Unit Kerja</th>
                <th className="py-2.5 px-3 w-[18%]">Role Akses</th>
                <th className="py-2.5 px-3 w-[14%] text-center">Status Verifikasi</th>
                <th className="py-2.5 px-3 w-[10%] text-center">Hak Akses</th>
                <th className="py-2.5 px-3 w-20 text-right">Aksi</th>
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
                const isVerified = p.is_verified !== false && p.isVerified !== false;
                const nameStr = p.nama || p.name || "Petugas";

                return (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-2.5 px-3 text-center font-bold text-slate-400 tabular-nums">
                      {(page - 1) * perPage + idx + 1}
                    </td>

                    {/* Petugas & Akun */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 border border-slate-200/80 overflow-hidden shrink-0 shadow-2xs">
                          {p.avatar_url &&
                          p.avatar_url !== "/kemenag.svg" &&
                          p.email !== "baritoutara@kemenag.go.id" ? (
                            <img
                              src={p.avatar_url || p.avatarUrl}
                              alt={nameStr}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <img
                              src="/kemenag.svg"
                              alt="Logo Kemenag"
                              className="h-full w-full object-contain p-1"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{nameStr}</p>
                          <p className="text-[11px] text-slate-500 truncate">{p.email || "-"}</p>
                        </div>
                      </div>
                    </td>

                    {/* Jabatan & Unit Kerja */}
                    <td className="py-2.5 px-3">
                      <p className="font-bold text-slate-800 truncate">
                        {p.jabatan || <span className="text-slate-400 font-normal italic">-</span>}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {p.unit_kerja || "Kantor Kementerian Agama"}
                      </p>
                    </td>

                    {/* Role Akses */}
                    <td className="py-2.5 px-3">
                      <RoleBadge role={p.role} email={p.email} />
                    </td>

                    {/* Status Verifikasi */}
                    <td className="py-2.5 px-3">
                      {!isVerified ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10.5px] font-bold text-amber-700">
                            <AlertCircle className="h-3 w-3" />
                            Menunggu
                          </span>
                          {viewerIsSuperAdmin && (
                            <button
                              onClick={() => handleVerify(p)}
                              disabled={isPending}
                              className="inline-flex items-center gap-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-0.5 text-[10.5px] font-bold shadow-2xs cursor-pointer transition-colors"
                            >
                              <UserCheck className="h-3 w-3" />
                              Verifikasi
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10.5px] font-bold text-emerald-700">
                            <CheckCircle2 className="h-3 w-3" />
                            Terverifikasi
                          </span>
                          {p.status === "inactive" && (
                            <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-bold">
                              Nonaktif
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Hak Akses / Permissions */}
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => onOpenPermissions(p)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-2xs hover:text-emerald-700 hover:border-emerald-300 transition-colors cursor-pointer"
                      >
                        <Key className="h-3 w-3 text-amber-600" />
                        Izin Menu
                      </button>
                    </td>

                    {/* Aksi */}
                    <td className="py-2.5 px-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 rounded-md text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                          title="Edit Data Petugas"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        {viewerIsSuperAdmin && (
                          <button
                            onClick={() => setDeletingUser(p)}
                            className="p-1.5 rounded-md text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Hapus Akun Petugas"
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
                        {searchQuery || statusFilter !== "all" || roleFilter !== "all"
                          ? "Tidak ada data petugas yang sesuai dengan filter / kata kunci."
                          : "Belum ada data petugas."}
                      </p>
                      {(searchQuery || statusFilter !== "all" || roleFilter !== "all") && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery("");
                            setStatusFilter("all");
                            setRoleFilter("all");
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

      {/* Edit Petugas Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-2xl sm:max-w-3xl lg:max-w-4xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <Pencil className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Edit Profil Petugas Admin</h3>
                  <p className="text-xs text-slate-500">
                    Perbarui profil dan wewenang akun {editingUser.nama || editingUser.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Petugas</label>
                <input
                  type="text"
                  value={editForm.nama}
                  onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  required
                />
              </div>


              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Role Admin</label>
                  <ModernSelect
                    options={roleOptions}
                    value={editForm.role}
                    onChange={(val) => setEditForm({ ...editForm, role: val })}
                    placeholder="Pilih Role"
                    size="md"
                    menuClassName="min-w-[220px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Status Akun</label>
                  <ModernSelect
                    options={[
                      { value: "active", label: "Aktif" },
                      { value: "inactive", label: "Nonaktif" },
                    ]}
                    value={editForm.status}
                    onChange={(val) => setEditForm({ ...editForm, status: val })}
                    placeholder="Pilih Status"
                    size="md"
                    menuClassName="min-w-[160px]"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
                >
                  {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tambah Petugas Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-2xl sm:max-w-3xl lg:max-w-4xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Tambah Akun Petugas Admin</h3>
                  <p className="text-xs text-slate-500">
                    Buat akun login baru untuk petugas PTSP / seksi instansi
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAddPetugas} className="space-y-4" autoComplete="off">
              {/* Fake hidden inputs to intercept Chromium aggressive autofill */}
              <input type="text" name="fake_usernamereadonly" style={{ display: "none" }} tabIndex={-1} aria-hidden="true" />
              <input type="password" name="fake_passwordreadonly" style={{ display: "none" }} tabIndex={-1} aria-hidden="true" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="petugas_nama_baru"
                    id="petugas_nama_baru"
                    autoComplete="off"
                    value={addForm.nama}
                    onChange={(e) => setAddForm({ ...addForm, nama: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    placeholder="Misal: Ahmad Fauzi, S.Kom."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Login <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    name="petugas_email_baru"
                    id="petugas_email_baru"
                    autoComplete="off"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    placeholder="petugas@kemenag.go.id"
                  />
                </div>
              </div>


              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Role Akses <span className="text-rose-500">*</span>
                  </label>
                  <ModernSelect
                    options={roleOptions}
                    value={addForm.role}
                    onChange={(val) => setAddForm({ ...addForm, role: val })}
                    placeholder="Pilih Role"
                    size="md"
                    menuClassName="min-w-[260px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Password Akun <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="petugas_password_baru"
                      id="petugas_password_baru"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={addForm.password}
                      onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                      className="w-full pl-3.5 pr-9 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      placeholder="Min. 8 karakter"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <label className="inline-flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addForm.is_verified}
                    onChange={(e) => setAddForm({ ...addForm, is_verified: e.target.checked })}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    Langsung verifikasi & aktifkan akun ini (dapat langsung login)
                  </span>
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
                >
                  {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Simpan Petugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteUserModal
        deletingUser={deletingUser}
        isPending={isPending}
        onClose={() => setDeletingUser(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
