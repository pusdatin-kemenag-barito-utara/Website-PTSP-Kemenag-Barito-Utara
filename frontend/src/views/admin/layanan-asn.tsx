import { Users } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { LayananClient } from "@/components/admin/layanan/layanan-client";

export function LayananASNView({
  services,
  currentUserRole,
  isSuper,
}: {
  services: any[];
  currentUserRole: string;
  isSuper: boolean;
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Layanan Pegawai (ASN)"
        description="Manajemen data layanan khusus kepegawaian (Mutasi, KGB, Pangkat, dll)."
        icon={Users}
      />
      <LayananClient
        initialServices={services}
        currentUserRole={currentUserRole ?? ""}
        isSuperAdmin={isSuper}
        category="asn"
      />
    </div>
  );
}

export default LayananASNView;
