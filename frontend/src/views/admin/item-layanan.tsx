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
    <div className="space-y-4 pb-6">
      <ItemLayananClient
        initialItems={items ?? []}
        services={services ?? []}
        isSuperAdmin={isSuper}
      />
    </div>
  );
}

export default ItemLayananView;
