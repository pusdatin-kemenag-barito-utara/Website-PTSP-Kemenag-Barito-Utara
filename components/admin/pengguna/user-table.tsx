"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteUserPermanentlyAction } from "@/lib/actions/admin-users";
import { updatePetugasAction } from "@/lib/actions/register-petugas";
import { EditUserModal } from "./edit-user-modal";
import { DeleteUserModal } from "./delete-user-modal";
import { UserTablePagination } from "./user-table-pagination";
import { UserTableHeader } from "./user-table-header";
import { UserTableContent } from "./user-table-content";

export function UserTable({
  users,
  title,
  subtitle,
  icon,
  iconColor,
  emptyText,
  viewerIsSuperAdmin,
  onUserUpdated,
  onOpenPermissions,
  onUserDeleted,
  perPage = 10,
}: {
  users: any[];
  title: string;
  subtitle: string;
  icon: React.ElementType;
  iconColor: string;
  emptyText: string;
  showRoleChange: boolean;
  viewerIsSuperAdmin: boolean;
  onUserUpdated?: (userId: string, data: Record<string, any>) => void;
  onOpenPermissions?: (user: any) => void;
  onUserDeleted?: (userId: string) => void;
  perPage?: number;
}) {
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [deletingUser, setDeletingUser] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    email: "",
    phone: "",
    unit_kerja: "",
    role: "",
    newPassword: "",
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = searchQuery
    ? users.filter(
        (u) =>
          (u.full_name || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (u.email || "").toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : users;

  const totalPages = Math.ceil(filteredUsers.length / perPage);
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * perPage,
    page * perPage,
  );

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setPage(1);
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setEditForm({
      email: user.email || "",
      phone: user.phone || "",
      unit_kerja: user.unit_kerja || "",
      role: user.role || "",
      newPassword: "",
    });
    setShowNewPassword(false);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    startTransition(async () => {
      try {
        const result = await updatePetugasAction({
          userId: editingUser.id,
          email: editingUser.email,
          phone: editForm.phone,
          unit_kerja: editForm.unit_kerja,
          role: editForm.role,
          newPassword: editForm.newPassword || undefined,
        });

        if (result.success) {
          toast.success("Profil Diperbarui", {
            description: `Data ${editingUser.full_name || editingUser.email} telah berhasil diperbarui.`,
          });
          onUserUpdated?.(editingUser.id, {
            phone: editForm.phone,
            unit_kerja: editForm.unit_kerja,
            role: editForm.role,
            ...(editForm.newPassword
              ? { plain_password: editForm.newPassword }
              : {}),
          });
          setEditingUser(null);
        } else {
          toast.error("Gagal memperbarui", { description: result.error });
        }
      } catch (err: any) {
        toast.error("Terjadi kesalahan", { description: err.message });
      }
    });
  };

  const confirmDelete = () => {
    if (!deletingUser) return;
    startTransition(async () => {
      try {
        const result = await deleteUserPermanentlyAction(deletingUser.id);
        if (result.success) {
          toast.success("Akun Berhasil Dihapus", {
            description: `Data ${deletingUser.full_name || deletingUser.email} telah dibersihkan.`,
          });
          onUserDeleted?.(deletingUser.id);
          setDeletingUser(null);
        }
      } catch (err: any) {
        toast.error("Gagal menghapus", { description: err.message });
      }
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
      <UserTableHeader
        title={title}
        subtitle={subtitle}
        icon={icon}
        iconColor={iconColor}
        count={filteredUsers.length}
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
      />

      <UserTableContent
        paginatedUsers={paginatedUsers}
        page={page}
        perPage={perPage}
        emptyText={emptyText}
        viewerIsSuperAdmin={viewerIsSuperAdmin}
        onEdit={openEditModal}
        onDelete={setDeletingUser}
        onOpenPermissions={onOpenPermissions}
      />

      <UserTablePagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      <EditUserModal
        editingUser={editingUser}
        editForm={editForm}
        showNewPassword={showNewPassword}
        isPending={isPending}
        onClose={() => setEditingUser(null)}
        onFormChange={setEditForm}
        onTogglePassword={() => setShowNewPassword(!showNewPassword)}
        onSubmit={handleUpdate}
      />

      <DeleteUserModal
        deletingUser={deletingUser}
        isPending={isPending}
        onClose={() => setDeletingUser(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
