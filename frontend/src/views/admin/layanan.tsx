import { FileText } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { LayananClient } from "@/components/admin/layanan/layanan-client";

export function LayananView({
  services,
  currentUserRole,
  isSuper,
  isGeneralAdmin,
  bidangLabel,
}: {
  services: any[];
  currentUserRole: string;
  isSuper: boolean;
  isGeneralAdmin: boolean;
  bidangLabel?: string;
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelola Layanan"
        description={
          isSuper || isGeneralAdmin
            ? "Manajemen data layanan utama untuk semua bidang — urutan, visibilitas, dan kepemilikan."
            : `Menampilkan layanan untuk bidang: ${bidangLabel}`
        }
        icon={FileText}
      />
      <LayananClient
        initialServices={services}
        currentUserRole={currentUserRole}
        isSuperAdmin={isSuper}
        category="public"
      />
    </div>
  );
}

export default LayananView;
