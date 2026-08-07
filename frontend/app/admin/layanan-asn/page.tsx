import { Users } from "lucide-react";
import { requirePermission } from "@/lib/auth";
import { fetchAPI } from "@/lib/api";
import { PageHeader } from "@/components/admin/page-header";
import { isSuperAdmin, getAdminSpecificRole } from "@/lib/constants";
import { LayananClient } from "@/components/admin/layanan/layanan-client";

export default async function AdminLayananASNPage() {
  const profile = await requirePermission("layanan");

  const isSuper = isSuperAdmin(profile.email);
  const specificRole = getAdminSpecificRole(profile.email, profile.role ?? "");

  let services: any[] = [];
  try {
    const res = await fetchAPI<any>("/services");
    if (res && res.data && Array.isArray(res.data)) {
      services = res.data.filter((s: any) => s.category === "asn");
    }
  } catch (err) {
    console.error("Failed to fetch ASN services from Golang API:", err);
  }

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
