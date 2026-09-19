import { useState, useTransition } from "react";
import {
  Users,
  Inbox,
  Search,
  Trash2,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  MessageSquare,
  Globe,
  Pencil,
  Loader2,
  X,
} from "lucide-react";
import { motion as m, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { fetchAPI } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { RoleBadge } from "./role-badge";
import { PasswordCell } from "./password-cell";
import { DeleteUserModal } from "./delete-user-modal";
import { UserTablePagination } from "./user-table-pagination";
import { ModernSelect } from "@/components/ui/modern-select";
import { deletePemohonPermanentlyAction } from "@/lib/actions/admin/admin-users";

export function PemohonTable({
  users,
  viewerIsSuperAdmin,
  onUserDeleted,
  onUserUpdated,
  visibleUserId,
  onTogglePassword,
}: {
  users: any[];
  viewerIsSuperAdmin: boolean;
  onUserDeleted: (id: string) => void;
  onUserUpdated?: (id: string, data: any) => void;
  visibleUserId?: string | null;
  onTogglePassword?: (userId: string) => void;
}) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [isPending, startTransition] = useTransition();
  const [deletingUser, setDeletingUser] = useState<any | null>(null);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    nama: "",
    no_hp: "",
    alamat: "",
    status: "active",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [metodeFilter, setMetodeFilter] = useState("all");

  // Filter users (Maximal multi-term token search across all attributes)
  const filteredUsers = users.filter((u: any) => {
    const query = searchQuery.toLowerCase().trim();
    let matchSearch = true;
    if (query) {
      const tokens = query.split(/\s+/).filter(Boolean);
      const cleanPhone = (u.no_hp || u.phone || "").replace(/\D/g, "");
      const haystack = [
        u.nama || u.fullName || u.name || "",
        u.no_hp || u.phone || "",
        cleanPhone,
        u.email || "",
        u.alamat || u.address || "",
        u.metode_login || "",
        u.status || "",
      ]
        .join(" ")
        .toLowerCase();

      matchSearch = tokens.every((token) => haystack.includes(token));
    }

    let matchMetode = true;
    const loginMethod = (u.metode_login || "").toLowerCase();
    if (metodeFilter === "google") {
      matchMetode = loginMethod.includes("google") || (!!u.email && !loginMethod.includes("whatsapp"));
    } else if (metodeFilter === "whatsapp") {
      matchMetode = loginMethod.includes("whatsapp") || loginMethod.includes("ptsp") || (!!u.no_hp && !u.email);
    }

    return matchSearch && matchMetode;
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / perPage));
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * perPage,
    page * perPage,
  );

  const confirmDelete = async () => {
    if (!deletingUser) return;
    const target = deletingUser;
    setDeletingUser(null);
    const toastId = toast.loading(`Sedang menghapus akun ${target.nama || target.fullName || target.phone}...`);

    try {
      const res = await deletePemohonPermanentlyAction(
        target.id,
        target.user_id || target.userId,
        target.email,
      );
      toast.dismiss(toastId);
      if (res?.success) {
        toast.success("Akun Pemohon Berhasil Dihapus", {
          description: `Data ${target.nama || target.fullName || target.phone} dan akun otentikasinya telah dihapus permanen secara bersih.`,
        });
        onUserDeleted(target.id);
      } else {
        toast.error("Gagal menghapus", {
          description: res?.error || "Terjadi kesalahan",
        });
      }
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error("Terjadi kesalahan sistem", {
        description: err.message,
      });
    }
  };

  const openEdit = (u: any) => {
    setEditingUser(u);
    setEditForm({
      nama: u.nama || u.fullName || u.name || "",
      no_hp: u.no_hp || u.phone || "",
      alamat: u.alamat || u.address || "",
      status: u.status || "active",
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const targetId = editingUser.id;
    setEditingUser(null);
    const toastId = toast.loading("Menyimpan data pemohon...");

    try {
      const res = await fetchAPI<any>(`/admin/users/pemohon/${targetId}`, {
        method: "PATCH",
        body: JSON.stringify(editForm),
      });
      toast.dismiss(toastId);
      if (res?.success) {
        toast.success("Data Pemohon Berhasil Diperbarui");
        onUserUpdated?.(targetId, editForm);
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

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
      {/* Header & Filter Bar */}
      <div className="border-b border-slate-200/80 px-4 py-3 bg-slate-50/60 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-[#059669]">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Daftar Pemohon Masyarakat ({filteredUsers.length})
            </h3>
            <p className="text-[11px] text-slate-400">
              Data warga / pemohon yang mendaftar via Google Akun atau WhatsApp OTP.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input with Clear Button */}
          <div className="relative min-w-[200px] flex-1 md:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, nomor HP, email..."
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

          {/* Metode Login Filter (ModernSelect) */}
          <div className="w-48 sm:w-52 shrink-0">
            <ModernSelect
              options={[
                { value: "all", label: "Semua Metode Login" },
                { value: "google", label: "Google Akun" },
                { value: "whatsapp", label: "WhatsApp (PTSP)" },
              ]}
              value={metodeFilter}
              onChange={(val) => {
                setMetodeFilter(val);
                setPage(1);
              }}
              placeholder="Semua Metode Login"
              size="sm"
              menuClassName="min-w-[200px]"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-100/50 text-[10px] font-black uppercase tracking-wider text-slate-500">
              <th className="py-2.5 px-3 w-10 text-center">#</th>
              <th className="py-2.5 px-3">Pemohon</th>
              <th className="py-2.5 px-3">Kontak & WhatsApp</th>
              <th className="py-2.5 px-3">Alamat Domisili</th>
              <th className="py-2.5 px-3">Metode Registrasi</th>
              <th className="py-2.5 px-3">Terdaftar</th>
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
            {paginatedUsers.map((user, idx) => {
              const nameStr = user.nama || user.fullName || user.name || "Pemohon";
              const phoneStr = user.no_hp || user.phone || "";
              const loginMethod = (user.metode_login || "").toLowerCase();
              const isGoogle = loginMethod.includes("google") || (!!user.email && !loginMethod.includes("whatsapp"));

              // Clean phone for wa.me link (replace 08 with 628)
              const cleanPhone = phoneStr.replace(/\D/g, "");
              const waNumber = cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone;

              return (
                <tr
                  key={user.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-2.5 px-3 text-center font-bold text-slate-400 tabular-nums">
                    {(page - 1) * perPage + idx + 1}
                  </td>

                  {/* Nama & Email */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-black text-xs select-none shadow-2xs">
                        {nameStr.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">{nameStr}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email || "-"}</p>
                      </div>
                    </div>
                  </td>

                  {/* Kontak & WhatsApp */}
                  <td className="py-2.5 px-3">
                    {phoneStr ? (
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs text-slate-700">{phoneStr}</span>
                        {cleanPhone && (
                          <a
                            href={`https://wa.me/${waNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100 transition-colors"
                            title="Buka WhatsApp"
                          >
                            <MessageSquare className="h-3 w-3" />
                            Chat
                          </a>
                        )}
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">-</span>
                    )}
                  </td>

                  {/* Alamat */}
                  <td className="py-2.5 px-3 max-w-[180px]">
                    <p className="text-[11px] text-slate-600 truncate">
                      {user.alamat || user.address || <span className="text-slate-400 italic">-</span>}
                    </p>
                  </td>

                  {/* Metode Registrasi */}
                  <td className="py-2.5 px-3">
                    {isGoogle ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2 py-0.5 text-[10.5px] font-bold text-blue-700 border border-blue-200/60">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        Google Login
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-bold text-emerald-700 border border-emerald-200/60">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        WhatsApp OTP
                      </span>
                    )}
                  </td>

                  {/* Terdaftar */}
                  <td className="py-2.5 px-3 text-[11px] text-slate-500 whitespace-nowrap">
                    {formatDate(user.createdAt || user.created_at)}
                  </td>

                  {/* Aksi */}
                  <td className="py-2.5 px-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => openEdit(user)}
                        className="p-1.5 rounded-md text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                        title="Edit Pemohon"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingUser(user)}
                        className="p-1.5 rounded-md text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Hapus Akun Pemohon"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {!paginatedUsers.length && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Inbox className="h-8 w-8 text-slate-300" />
                    <p className="text-xs font-bold text-slate-600">
                      {searchQuery || metodeFilter !== "all"
                        ? "Tidak ada data pemohon yang sesuai dengan filter / kata kunci."
                        : "Belum ada pemohon terdaftar."}
                    </p>
                    {(searchQuery || metodeFilter !== "all") && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setMetodeFilter("all");
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

      {/* Pagination */}
      <UserTablePagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>

    {/* Edit Pemohon Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl border border-slate-100">
            <h3 className="text-sm font-black text-slate-900 mb-1">Edit Akun Pemohon</h3>
            <p className="text-xs text-slate-500 mb-4">
              Perbarui identitas kontak & alamat pemohon masyarakat.
            </p>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Pemohon</label>
                <input
                  type="text"
                  value={editForm.nama}
                  onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">No. WhatsApp / HP</label>
                <input
                  type="text"
                  value={editForm.no_hp}
                  onChange={(e) => setEditForm({ ...editForm, no_hp: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium"
                  placeholder="Misal: 081234567890"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Alamat Domisili</label>
                <textarea
                  rows={3}
                  value={editForm.alamat}
                  onChange={(e) => setEditForm({ ...editForm, alamat: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium resize-none"
                  placeholder="Alamat lengkap pemohon..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Status Akun</label>
                <ModernSelect
                  options={[
                    { value: "active", label: "Aktif" },
                    { value: "inactive", label: "Nonaktif" },
                  ]}
                  value={editForm.status}
                  onChange={(val) => setEditForm({ ...editForm, status: val })}
                  placeholder="Pilih Status"
                  size="sm"
                  menuClassName="min-w-[160px]"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
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
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      <DeleteUserModal
        deletingUser={deletingUser}
        isPending={isPending}
        onClose={() => setDeletingUser(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
