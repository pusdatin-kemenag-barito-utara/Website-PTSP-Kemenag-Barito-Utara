import { FileText } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { fetchAPI } from "@/lib/api";
import { PageHeader } from "@/components/admin/page-header";
import { PersyaratanClient } from "@/components/admin/persyaratan/persyaratan-client";
import { isSuperAdmin, getAdminSpecificRole } from "@/lib/constants";

export default async function AdminRequirementsPage() {
  const profile = await requireAdmin();
  const isSuper = isSuperAdmin(profile.email);
  const specificRole = getAdminSpecificRole(profile.email, profile.role ?? "");
  const isGeneralAdmin = specificRole === "admin_ptsp";
  const roleOwnerFilter = isSuper || isGeneralAdmin ? undefined : specificRole;

  // Fetch all services (dengan items & requirements) dari Golang backend
  const res = await fetchAPI<any>("/services");
  const allServices: any[] = res?.data ?? [];

  // Flatten semua service items dari seluruh layanan
  let allItems: any[] = [];
  let allRequirements: any[] = [];

  for (const service of allServices) {
    // Filter berdasarkan role bila bukan admin umum
    if (roleOwnerFilter && service.role_owner !== roleOwnerFilter) continue;

    const items: any[] = service.items ?? service.service_items ?? [];
    for (const item of items) {
      allItems.push({ id: item.id, name: item.name });

      const reqs: any[] = item.requirements ?? [];
      for (const req of reqs) {
        allRequirements.push({
          ...req,
          serviceItem: { name: item.name },
          serviceItemId: item.id,
        });
      }
    }
  }

  // Sort items by name, requirements by serviceItemId then id
  allItems.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
  allRequirements.sort((a, b) => {
    const itemDiff = String(a.serviceItemId).localeCompare(String(b.serviceItemId));
    if (itemDiff !== 0) return itemDiff;
    return String(a.id).localeCompare(String(b.id));
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelola Persyaratan"
        description="Atur dokumen persyaratan yang harus diunggah untuk tiap item layanan."
        icon={FileText}
      />
      <PersyaratanClient
        initialRequirements={allRequirements}
        items={allItems}
      />
    </div>
  );
}
