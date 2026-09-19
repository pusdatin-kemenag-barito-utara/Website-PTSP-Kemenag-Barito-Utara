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
    <div className="space-y-4 pb-6">
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
