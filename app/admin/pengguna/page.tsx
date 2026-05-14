import { Users } from 'lucide-react';
import { requireAdmin } from '@/lib/auth';
import prisma, { serializeBigInt } from '@/lib/prisma';
import { PageHeader } from '@/components/admin/page-header';
import { PenggunaClient } from '@/components/admin/pengguna/pengguna-client';

export default async function AdminUsersPage() {
  const profile = await requireAdmin();

  const data = await prisma.profiles.findMany({
    orderBy: { created_at: 'desc' },
  });

  const users = serializeBigInt(data);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Petugas & Pengguna"
        description="Kelola role dan akses pengguna sistem PTSP Kemenag Barito Utara."
        icon={Users}
      />
      <PenggunaClient initialUsers={users ?? []} currentEmail={profile.email ?? undefined} />
    </div>
  );
}
