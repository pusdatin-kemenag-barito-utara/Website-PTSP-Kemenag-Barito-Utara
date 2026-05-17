import { Users } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { db, serializeBigInt } from "@/lib/db";
import { profiles as profilesTable } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { PageHeader } from "@/components/admin/page-header";
import { PenggunaClient } from "@/components/admin/pengguna/pengguna-client";

export default async function AdminUsersPage() {
  const profile = await requireAdmin();

  const data = await db.query.profiles.findMany({
    orderBy: [desc(profilesTable.createdAt)],
  });

  const users = serializeBigInt(data);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Petugas & Pengguna"
        description="Kelola role dan akses pengguna sistem PTSP Kemenag Barito Utara."
        icon={Users}
      />
      <PenggunaClient
        initialUsers={users ?? []}
        currentEmail={profile.email ?? undefined}
      />
    </div>
  );
}
