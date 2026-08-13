import { Layers } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { ItemLayananClient } from "@/components/admin/item-layanan/item-layanan-client";

export function ItemLayananView({
  items,
  services,
  isSuper,
}: {
  items: any[];
  services: any[];
  isSuper: boolean;
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelola Item Layanan"
        description="Kelola daftar sub-layanan, formulir, dan persyaratan untuk setiap induk layanan."
        icon={Layers}
      />
      <ItemLayananClient
        initialItems={items ?? []}
        services={services ?? []}
        isSuperAdmin={isSuper}
      />
    </div>
  );
}

export default ItemLayananView;
