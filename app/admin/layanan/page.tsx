import { FileText } from "lucide-react";
import { requirePermission } from "@/lib/auth";
import { db, serializeBigInt } from "@/lib/db";
import { services as servicesTable } from "@/lib/db/schema";
import { eq, asc, and } from "drizzle-orm";
import { PageHeader } from "@/components/admin/page-header";
import { isSuperAdmin, getAdminSpecificRole } from "@/lib/constants";
import { LayananClient } from "@/components/admin/layanan/layanan-client";

export default async function AdminServicesPage() {
  const profile = await requirePermission("layanan");

  const isSuper = isSuperAdmin(profile.email);
  
  // Dapatkan role spesifik bidang berdasarkan email
  const specificRole = getAdminSpecificRole(profile.email, profile.role ?? "");
  
  // Jika role spesifik tetap admin_ptsp, berarti admin umum (atau jika super_admin)
  const isGeneralAdmin = specificRole === "admin_ptsp";

  let services: any[] = [];

  const whereClause =
    isSuper || isGeneralAdmin
      ? eq(servicesTable.category, "public")
      : and(eq(servicesTable.roleOwner, specificRole as any), eq(servicesTable.category, "public"));

  const data = await db.query.services.findMany({
    where: whereClause,
    orderBy: [asc(servicesTable.sortOrder)],
    with: {
      serviceItems: true,
    },
  });

  services = serializeBigInt(data) ?? [];

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
