import { Users } from "lucide-react";
import { requirePermission } from "@/lib/auth";
import { db, serializeBigInt } from "@/lib/db";
import { services as servicesTable } from "@/lib/db/schema";
import { eq, asc, and } from "drizzle-orm";
import { PageHeader } from "@/components/admin/page-header";
import { isSuperAdmin, getAdminSpecificRole } from "@/lib/constants";
import { LayananClient } from "@/components/admin/layanan/layanan-client";

export default async function AdminLayananASNPage() {
  const profile = await requirePermission("layanan");

  const isSuper = isSuperAdmin(profile.email);
  
  // Dapatkan role spesifik bidang berdasarkan email
  const specificRole = getAdminSpecificRole(profile.email, profile.role ?? "");
  
  // Jika role spesifik tetap admin_ptsp, berarti admin umum (atau jika super_admin)
  const isGeneralAdmin = specificRole === "admin_ptsp";

  let services: any[] = [];

  const whereClause =
    isSuper || isGeneralAdmin
      ? eq(servicesTable.category, "asn")
      : and(eq(servicesTable.roleOwner, specificRole as any), eq(servicesTable.category, "asn"));

  const data = await db.query.services.findMany({
    where: whereClause,
    orderBy: [asc(servicesTable.sortOrder)],
  });

  services = serializeBigInt(data) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Layanan Pegawai (ASN)"
        description="Manajemen data layanan khusus kepegawaian (Mutasi, KGB, Pangkat, dll)."
        icon={Users}
      />
      <LayananClient
        initialServices={services}
        currentUserRole={specificRole ?? ""}
        isSuperAdmin={isSuper}
        category="asn"
      />
    </div>
  );
}
