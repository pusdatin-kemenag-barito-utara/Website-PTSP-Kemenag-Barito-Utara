import { Layers } from "lucide-react";
import { requirePermission } from "@/lib/auth";
import { fetchAPI } from "@/lib/api";
import { PageHeader } from "@/components/admin/page-header";
import { ItemLayananClient } from "@/components/admin/item-layanan/item-layanan-client";
import { isSuperAdmin } from "@/lib/constants";

export default async function AdminServiceItemsPage() {
  const profile = await requirePermission("layanan");
  const isSuper = isSuperAdmin(profile.email);

  let services: any[] = [];
  let items: any[] = [];

  try {
    const res = await fetchAPI<any>("/services");
    if (res && res.data && Array.isArray(res.data)) {
      services = res.data;
      services.forEach((s: any) => {
        if (s.items && Array.isArray(s.items)) {
          s.items.forEach((item: any) => {
            items.push({
              ...item,
              service: { name: s.name },
            });
          });
        }
      });
    }
  } catch (err) {
    console.error("Failed to fetch service items from Golang API:", err);
  }

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
