import { Users } from "lucide-react";
import { requirePermission } from "@/lib/auth";
import { fetchAPI } from "@/lib/api";
import { PageHeader } from "@/components/admin/page-header";
import { PenggunaClient } from "@/components/admin/pengguna/pengguna-client";

export default async function AdminUsersPage() {
  const profile = await requirePermission("pengguna");

  const res = await fetchAPI<{ data: any[] }>("/admin/users");
  const users = res?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Petugas & Pengguna"
        description="Kelola role dan akses pengguna sistem PTSP Kemenag Barito Utara."
        icon={Users}
      />
      <PenggunaClient
        initialUsers={users}
        currentEmail={profile.email ?? undefined}
      />
    </div>
  );
}
