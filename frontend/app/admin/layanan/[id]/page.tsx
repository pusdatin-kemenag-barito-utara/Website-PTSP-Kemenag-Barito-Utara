import { requirePermission } from "@/lib/auth";
import { fetchAPI } from "@/lib/api";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { FolderOpen, ArrowLeft } from "lucide-react";
import { isSuperAdmin, getAdminSpecificRole } from "@/lib/constants";
import Link from "next/link";
import { ServiceWizardClient } from "@/components/admin/layanan/service-wizard-client";

export const revalidate = 0;

export default async function ServiceWizardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await requirePermission("layanan");
  const isSuper = isSuperAdmin(profile.email);
  const { id } = await params;

  let service: any = null;
  try {
    const res = await fetchAPI<any>("/services", { cache: "no-store" });
    if (res && res.data && Array.isArray(res.data)) {
      service = res.data.find((s: any) => String(s.id) === String(id));
    }
  } catch (err) {
    console.error("Failed to fetch service wizard data from Golang API:", err);
  }

  if (!service) {
    notFound();
  }

  const specificRole = getAdminSpecificRole(profile.email, profile.role ?? "");
  const isGeneralAdmin = specificRole === "admin_ptsp";

  if (!isSuper && !isGeneralAdmin && service.roleOwner !== specificRole) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/layanan"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/80 text-xs font-bold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/80 hover:border-emerald-200/80 shadow-2xs transition-all duration-200 mb-4 group cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-1" />
          <span>Kembali ke Daftar Layanan</span>
        </Link>
        <PageHeader
          title={`Kelola: ${service.name}`}
          description="Pusat kontrol untuk mengelola Item Layanan, Form Input, dan Persyaratan Dokumen dalam satu tempat."
          icon={FolderOpen}
        />
      </div>

      <ServiceWizardClient initialService={service} isSuperAdmin={isSuper} />
    </div>
  );
}
