import { Users } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { PenggunaClient } from "@/components/admin/pengguna/pengguna-client";

export function PenggunaView({
  initialUsers,
  currentEmail,
}: {
  initialUsers: any[];
  currentEmail?: string;
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Petugas & Pengguna"
        description="Kelola role dan akses pengguna sistem PTSP Kemenag Barito Utara."
        icon={Users}
      />
      <PenggunaClient
        initialUsers={initialUsers}
        currentEmail={currentEmail}
      />
    </div>
  );
}

export default PenggunaView;
