import { motion as m, AnimatePresence } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import { isSuperAdmin } from "@/lib/constants";
import { RoleBadge } from "./role-badge";
import { PasswordCell } from "./password-cell";

export function UserTableContent({
  paginatedUsers,
  page,
  perPage,
  emptyText,
  viewerIsSuperAdmin,
  onEdit,
  onDelete,
  onOpenPermissions,
  visibleUserId,
  onTogglePassword,
}: {
  paginatedUsers: any[];
  page: number;
  perPage: number;
  emptyText: string;
  viewerIsSuperAdmin: boolean;
  onEdit: (user: any) => void;
  onDelete: (user: any) => void;
  onOpenPermissions?: (user: any) => void;
  visibleUserId: string | null;
  onTogglePassword: (userId: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200/60 bg-slate-50/50">
            <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
              #
            </th>
            <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
              Petugas
            </th>
            <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
              Role
            </th>
            {viewerIsSuperAdmin && (
              <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                Akses
              </th>
            )}
            {viewerIsSuperAdmin && (
              <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                Password
              </th>
            )}
            <th className="px-5 py-3 text-right text-[10px] font-black uppercase tracking-wider text-slate-400">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          <AnimatePresence>
            {paginatedUsers.map((user, idx) => (
              <m.tr
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={user.id}
                className="group hover:bg-slate-50/50"
              >
                <td className="px-5 py-4 text-xs text-slate-400">
                  {(page - 1) * perPage + idx + 1}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs">
                      {(user.fullName || "U").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">
                        {user.fullName || "-"}
                      </p>
                      <p className="text-[11px] text-slate-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <RoleBadge role={user.role} email={user.email} />
                </td>
                {viewerIsSuperAdmin && (
                  <td className="px-5 py-4">
                    <button
                      onClick={() => onOpenPermissions?.(user)}
                      className="text-[10px] font-bold uppercase tracking-wider text-[#059669] hover:underline"
                    >
                      {user.permissions?.length || 0} Fitur
                    </button>
                  </td>
                )}
                {viewerIsSuperAdmin && (
                  <td className="px-5 py-4">
                    <PasswordCell hasPassword={!!user.email} />
                  </td>
                )}
                <td className="px-5 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(user)}
                      className="p-2 text-slate-400 hover:text-[#059669] hover:bg-emerald-50 rounded-lg"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    {viewerIsSuperAdmin && !isSuperAdmin(user.email) && (
                      <button
                        onClick={() => onDelete(user)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </m.tr>
            ))}
          </AnimatePresence>
          {!paginatedUsers.length && (
            <tr>
              <td
                colSpan={6}
                className="px-5 py-12 text-center text-slate-400 italic"
              >
                {emptyText}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
