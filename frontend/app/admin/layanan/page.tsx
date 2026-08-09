import { FileText } from "lucide-react";
import { requirePermission } from "@/lib/auth";
import { fetchAPI } from "@/lib/api";
import { PageHeader } from "@/components/admin/page-header";
import { isSuperAdmin, getAdminSpecificRole } from "@/lib/constants";
import { LayananClient } from "@/components/admin/layanan/layanan-client";

export const revalidate = 0;

export default async function AdminServicesPage() {
  const profile = await requirePermission("layanan");

  const isSuper = isSuperAdmin(profile.email);
  const specificRole = getAdminSpecificRole(profile.email, profile.role ?? "");
  const isGeneralAdmin = specificRole === "admin_ptsp";

  let services: any[] = [];
  try {
    const res = await fetchAPI<any>("/services", { cache: "no-store" });
    if (res && res.data && Array.isArray(res.data)) {
      services = res.data.filter((s: any) => s.category === "public" || !s.category);
    }
  } catch (err) {
    console.error("Failed to fetch services from Golang API:", err);
  }

  const bidangLabel = specificRole
    ?.replace("admin_", "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c: string) => c.toUpperCase());

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
        currentUserRole={specificRole ?? ""}
        isSuperAdmin={isSuper}
        category="public"
      />
    </div>
  );
}
