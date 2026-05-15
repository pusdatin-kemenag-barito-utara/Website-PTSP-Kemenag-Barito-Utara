"use client";

import { useState, useTransition } from "react";
import {
  Users,
  Inbox,
  ChevronLeft,
  ChevronRight,
  Search,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { deleteUserPermanentlyAction } from "@/lib/actions/admin-users";
import { formatDate } from "@/lib/utils";
import { RoleBadge } from "./role-badge";
import { PasswordCell } from "./password-cell";
import { DeleteUserModal } from "./delete-user-modal";

export function PemohonTable({
  users,
  viewerIsSuperAdmin,
  onUserDeleted,
}: {
  users: any[];
  viewerIsSuperAdmin: boolean;
  onUserDeleted: (id: string) => void;
}) {
  const PER_PAGE = 10;
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [deletingUser, setDeletingUser] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = searchQuery
    ? users.filter(
        (u: any) =>
          (u.full_name || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (u.phone || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (u.address || "").toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : users;

  const totalPages = Math.ceil(filteredUsers.length / PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * PER_PAGE,
    page * PER_PAGE,
  );

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setPage(1);
  };

  const confirmDelete = () => {
    if (!deletingUser) return;
    startTransition(async () => {
      try {
        const result = await deleteUserPermanentlyAction(deletingUser.id);
        if (result.success) {
          toast.success("Akun Berhasil Dihapus", {
            description: `Seluruh data ${deletingUser.full_name || deletingUser.phone} dan file terkait telah dibersihkan.`,
          });
          onUserDeleted(deletingUser.id);
          setDeletingUser(null);
        }
      } catch (err: any) {
        toast.error("Gagal menghapus pengguna", { description: err.message });
      }
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white px-5 py-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800">
              Daftar Pemohon
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Pengguna yang mengajukan layanan melalui PTSP.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-lg bg-emerald-50 text-xs font-bold text-emerald-600 border border-emerald-200/60">
            {filteredUsers.length} pemohon
          </div>
          {users.length > 5 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Cari nama / no HP..."
                className="rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-700 w-48 transition-all focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 outline-none placeholder:text-slate-400"
              />
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200/60 bg-slate-50/50">
              <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-400 w-12">
                #
              </th>
              <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-400 w-44">
                Nama
              </th>
              <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-400 w-36">
                No HP / WA
              </th>
              <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                Alamat
              </th>
              <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-400 w-28">
                Role
              </th>
              {viewerIsSuperAdmin && (
                <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-400 w-40">
                  Password
                </th>
              )}
              <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-400 w-36">
                Terdaftar
              </th>
              <th className="px-5 py-3 text-right text-[10px] font-black uppercase tracking-wider text-slate-400 w-28">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <AnimatePresence>
              {paginatedUsers.map((user, idx) => (
                <motion.tr
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={user.id}
                  className="group transition-colors duration-150 hover:bg-slate-50/50"
                >
                  <td className="px-5 py-3.5 text-xs text-slate-400 tabular-nums">
                    {(page - 1) * PER_PAGE + idx + 1}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700 font-bold text-xs select-none">
                        {(user.full_name || "P").charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-900 truncate">
                        {user.full_name || (
                          <span className="italic text-slate-400">
                            Tanpa nama
                          </span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1 text-sm text-slate-700 font-medium tabular-nums">
                      {user.phone || "-"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <p
                      className="text-sm text-slate-600 line-clamp-2 leading-snug"
                      title={user.address || ""}
                    >
                      {user.address || (
                        <span className="text-slate-400 italic">
                          Belum diisi
                        </span>
                      )}
                    </p>
                  </td>
                  <td className="px-5 py-3.5">
                    <RoleBadge role={user.role} email={user.email} />
                  </td>
                  {viewerIsSuperAdmin && (
                    <td className="px-5 py-3.5">
                      <PasswordCell
                        password={user.plain_password}
                        canView={viewerIsSuperAdmin}
                      />
                    </td>
                  )}
                  <td className="px-5 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end">
                      <button
                        onClick={() => setDeletingUser(user)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 hover:border-red-200 transition-all duration-200 shadow-sm"
                      >
                        <Trash2 className="h-3 w-3" />
                        Hapus Akun
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
            {!paginatedUsers.length && (
              <tr>
                <td
                  colSpan={viewerIsSuperAdmin ? 8 : 7}
                  className="px-5 py-16 text-center"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
                      <Inbox className="h-7 w-7 text-slate-300" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-500">
                        Belum ada pemohon terdaftar.
                      </p>
                      {searchQuery && (
                        <p className="mt-1 text-xs text-slate-400">
                          Coba ubah kata kunci pencarian.
                        </p>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            Halaman <span className="font-bold text-slate-700">{page}</span>{" "}
            dari <span className="font-bold text-slate-700">{totalPages}</span>
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg hover:bg-slate-200/60 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`min-w-[28px] h-7 rounded-lg text-[11px] font-bold transition-all duration-200 ${
                  p === page
                    ? "bg-gradient-to-r from-[#059669] to-[#047857] text-white shadow-sm shadow-emerald-500/20"
                    : "text-slate-600 hover:bg-slate-200/60"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg hover:bg-slate-200/60 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
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
