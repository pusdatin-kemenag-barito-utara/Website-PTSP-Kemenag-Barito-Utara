import { FileText } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import prisma, { serializeBigInt } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { LayananClient } from "@/components/admin/layanan/layanan-client";
import { isSuperAdmin } from "@/lib/constants";

export default async function AdminServicesPage() {
  const profile = await requireAdmin();

  const isSuper = isSuperAdmin(profile.email);
  // admin_ptsp bisa juga lihat semua layanan
  const isGeneralAdmin = profile.role === "admin_ptsp";

  let services: any[] = [];

  const where = (isSuper || isGeneralAdmin) 
    ? {} 
    : { role_owner: profile.role };

  const data = await prisma.services.findMany({
    where,
    orderBy: { sort_order: "asc" },
  });
  
  services = serializeBigInt(data) ?? [];

  const bidangLabel = profile.role
    ?.replace("admin_", "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

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
        currentUserRole={profile.role ?? ""}
        isSuperAdmin={isSuper}
      />
    </div>
  );
}
