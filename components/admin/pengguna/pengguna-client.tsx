"use client";

import { useState } from "react";
import { isSuperAdmin, isAdminRole } from "@/lib/constants";
import { UserPermissionsModal } from "./user-permissions-manager";
import { UserTable } from "./user-table";
import { UserStatCards } from "./user-stat-cards";
import { SuperAdminCard } from "./super-admin-card";
import { PendingVerificationSection } from "./pending-verification-section";
import { PemohonTable } from "./pemohon-table";
import { Users, UserCog } from "lucide-react";

export function PenggunaClient({
  initialUsers,
  currentEmail,
}: {
  initialUsers: any[];
  currentEmail?: string;
}) {
  const [users, setUsers] = useState(initialUsers);
  const viewerIsSuperAdmin = isSuperAdmin(currentEmail);

  // Super admin (hardcoded email)
  const superAdmin = users.find((u) => isSuperAdmin(u.email));
  // Petugas yang BELUM diverifikasi
  const pendingUsers = users.filter(
    (u) =>
      isAdminRole(u.role) && !isSuperAdmin(u.email) && u.is_verified === false,
  );
  // Admin / Petugas yang SUDAH diverifikasi
  const adminUsers = users.filter(
    (u) =>
      isAdminRole(u.role) && !isSuperAdmin(u.email) && u.is_verified !== false,
  );
  // Pemohon
  const pemohonUsers = users.filter(
    (u) => !isAdminRole(u.role) && !isSuperAdmin(u.email),
  );

  const stats = {
    total: users.length,
    super_admin: superAdmin ? 1 : 0,
    admin: adminUsers.length,
    user: pemohonUsers.length,
    pending: pendingUsers.length,
  };

  const [permissionsUser, setPermissionsUser] = useState<any | null>(null);

  // Handle approve/reject — update local state immediately
  const handleVerify = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, is_verified: true } : u)),
    );
  };
  const handleReject = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleSavePermissions = (userId: string, perms: string[]) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, permissions: perms } : u)),
    );
  };

  return (
    <div className="space-y-6">
      <UserPermissionsModal
        user={permissionsUser}
        isOpen={!!permissionsUser}
        onClose={() => setPermissionsUser(null)}
        onSave={handleSavePermissions}
      />

      <UserStatCards stats={stats} />

      <SuperAdminCard superAdmin={superAdmin} />

      {viewerIsSuperAdmin && (
        <PendingVerificationSection
          pendingUsers={pendingUsers}
          onVerify={handleVerify}
          onReject={handleReject}
        />
      )}

      <UserTable
        users={adminUsers}
        title="Daftar Admin & Petugas"
        subtitle="Kelola akun tim yang bertugas di portal PTSP."
        icon={UserCog}
        iconColor="text-[#1f4bb7]"
        emptyText="Belum ada admin/petugas terdaftar."
        showRoleChange={viewerIsSuperAdmin}
        viewerIsSuperAdmin={viewerIsSuperAdmin}
        onUserUpdated={(id: string, data: any) => {
          setUsers((prev) =>
            prev.map((u) => (u.id === id ? { ...u, ...data } : u)),
          );
        }}
        onOpenPermissions={(user: any) => setPermissionsUser(user)}
        onUserDeleted={(id: string) => setUsers((prev) => prev.filter((u) => u.id !== id))}
      />

      <PemohonTable
        users={pemohonUsers}
        viewerIsSuperAdmin={viewerIsSuperAdmin}
        onUserDeleted={(id: string) => setUsers((prev) => prev.filter((u) => u.id !== id))}
      />
    </div>
  );
}
