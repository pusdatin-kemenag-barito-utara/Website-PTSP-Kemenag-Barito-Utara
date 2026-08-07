"use client";

import { useState } from "react";
import { isSuperAdmin, isAdminRole } from "@/lib/constants";
import { UserPermissionsModal } from "./user-permissions-manager";
import { UserTable } from "./user-table";
import { UserStatCards } from "./user-stat-cards";
import { SuperAdminCard } from "./super-admin-card";
import { PendingVerificationSection } from "./pending-verification-section";
import { PemohonTable } from "./pemohon-table";
import { Users, UserCog, BadgeCheck } from "lucide-react";

export function PenggunaClient({
  initialUsers,
  currentEmail,
}: {
  initialUsers: any[];
  currentEmail?: string;
}) {
  const [users, setUsers] = useState(initialUsers);
  const [visibleUserId, setVisibleUserId] = useState<string | null>(null);
  const viewerIsSuperAdmin = isSuperAdmin(currentEmail);

  // Super admin (hardcoded email)
  const superAdmin = users.find((u) => isSuperAdmin(u.email));
  
  // Petugas/Admin/Pegawai yang BELUM diverifikasi
  const pendingUsers = users.filter(
    (u) =>
      isAdminRole(u.role) && !isSuperAdmin(u.email) && u.isVerified === false,
  );
  
  // Admin PTSP (bukan pegawai) yang SUDAH diverifikasi
  const adminUsers = users.filter(
    (u) =>
      isAdminRole(u.role) && u.role !== "pegawai" && !isSuperAdmin(u.email) && u.isVerified !== false,
  );
  
  // Pegawai yang SUDAH diverifikasi
  const pegawaiUsers = users.filter(
    (u) => u.role === "pegawai" && !isSuperAdmin(u.email) && u.isVerified !== false,
  );
  
  // Pemohon
  const pemohonUsers = users.filter(
    (u) => !isAdminRole(u.role) && !isSuperAdmin(u.email),
  );

  const [activeTab, setActiveTab] = useState<"pegawai" | "pemohon">("pegawai");

  const stats = {
    total: users.length,
    superAdmin: superAdmin ? 1 : 0,
    admin: adminUsers.length,
    pegawai: pegawaiUsers.length,
    user: pemohonUsers.length,
    pending: pendingUsers.length,
  };

  const [permissionsUser, setPermissionsUser] = useState<any | null>(null);

  // Handle approve/reject — update local state immediately
  const handleVerify = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isVerified: true } : u)),
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

  const handleTogglePassword = (userId: string) => {
    setVisibleUserId((prev) => (prev === userId ? null : userId));
  };

  return (
    <div className="space-y-6">
      <UserPermissionsModal
        user={permissionsUser}
        isOpen={!!permissionsUser}
        onClose={() => setPermissionsUser(null)}
        onSave={handleSavePermissions}
      />

      <SuperAdminCard superAdmin={superAdmin} />

      <UserStatCards stats={stats} />

      {/* TABS SELECTOR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <div className="flex w-full sm:w-auto p-1 bg-slate-100/80 rounded-xl gap-1">

          
          <button
            onClick={() => setActiveTab("pegawai")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
              activeTab === "pegawai"
                ? "bg-white text-[#059669] shadow-sm ring-1 ring-slate-200"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <BadgeCheck className="h-4 w-4" />
            Daftar Pegawai
            <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] ${
              activeTab === "pegawai" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
            }`}>
              {pegawaiUsers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("pemohon")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
              activeTab === "pemohon"
                ? "bg-white text-[#059669] shadow-sm ring-1 ring-slate-200"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Users className="h-4 w-4" />
            Daftar Pemohon
            <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] ${
              activeTab === "pemohon" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
            }`}>
              {pemohonUsers.length}
            </span>
          </button>
        </div>

        <div className="hidden md:block px-4">
          <p className="text-[11px] text-slate-400 italic">
            Klik tab untuk beralih manajemen kategori pengguna.
          </p>
        </div>
      </div>

      <div className="transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">


        {activeTab === "pegawai" && (
          <div className="space-y-6">
            <UserTable
              users={pegawaiUsers}
              title="Daftar Pegawai"
              subtitle="Kelola akun pegawai instansi Kementerian Agama."
              icon={BadgeCheck}
              iconColor="text-blue-600"
              emptyText="Belum ada pegawai terdaftar."
              showRoleChange={viewerIsSuperAdmin}
              viewerIsSuperAdmin={viewerIsSuperAdmin}
              onUserUpdated={(id: string, data: any) => {
                setUsers((prev) =>
                  prev.map((u) => (u.id === id ? { ...u, ...data } : u)),
                );
              }}
              onOpenPermissions={(user: any) => setPermissionsUser(user)}
              onUserDeleted={(id: string) =>
                setUsers((prev) => prev.filter((u) => u.id !== id))
              }
              visibleUserId={visibleUserId}
              onTogglePassword={handleTogglePassword}
            />
          </div>
        )}

        {activeTab === "pemohon" && (
          <PemohonTable
            users={pemohonUsers}
            viewerIsSuperAdmin={viewerIsSuperAdmin}
            onUserDeleted={(id: string) =>
              setUsers((prev) => prev.filter((u) => u.id !== id))
            }
            visibleUserId={visibleUserId}
            onTogglePassword={handleTogglePassword}
          />
        )}
      </div>
    </div>
  );
}
