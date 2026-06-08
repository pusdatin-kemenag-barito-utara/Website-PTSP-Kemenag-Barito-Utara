import { requireAuth } from "@/lib/auth";
import { PageHeader } from "@/components/admin/page-header";
import { getPegawaiListAction } from "@/lib/actions/admin/kepegawaian";
import { Users } from "lucide-react";
import { PegawaiManager } from "@/components/admin/kepegawaian/pegawai-manager";

export default async function ManajemenPegawaiPage() {
  await requireAuth();
  
  const { data: pegawaiList, error } = await getPegawaiListAction();

  return (
    <div className="space-y-6 w-full mx-auto pb-10 px-2 sm:px-4">
      <PageHeader
        title="Manajemen Akun Pegawai"
        description="Kelola seluruh data dan akun pegawai Kantor Kemenag Barito Utara"
        icon={Users}
      />

      {error ? (
        <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm">{error}</div>
      ) : (
        <PegawaiManager initialData={pegawaiList || []} />
      )}
    </div>
  );
}
