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
    <div className="space-y-4 pb-6">
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
