import { requirePermission } from "@/lib/auth";
import { db, serializeBigInt } from "@/lib/db";
import {
  services as servicesTable,
  serviceItems as serviceItemsTable,
  serviceFormFields as serviceFormFieldsTable,
  serviceRequirements as serviceRequirementsTable,
} from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { FolderOpen, ArrowLeft } from "lucide-react";
import { isSuperAdmin, getAdminSpecificRole } from "@/lib/constants";
import Link from "next/link";
import { ServiceWizardClient } from "@/components/admin/layanan/service-wizard-client";

export default async function ServiceWizardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await requirePermission("layanan");
  const isSuper = isSuperAdmin(profile.email);

  // Next.js 15: params harus di-await terlebih dahulu
  const { id } = await params;

  // Fetch complete service data including items, forms, and requirements
  const serviceData = await db.query.services.findFirst({
    where: eq(servicesTable.id, BigInt(id)),
    with: {
      serviceItems: {
        orderBy: [asc(serviceItemsTable.sortOrder)],
        with: {
          serviceFormFields: {
            orderBy: [asc(serviceFormFieldsTable.sortOrder)],
          },
          serviceRequirements: {
            orderBy: [
              asc(serviceRequirementsTable.sortOrder),
              asc(serviceRequirementsTable.id),
            ],
          },
        },
      },
    },
  });

  if (!serviceData) {
    notFound();
  }

  // Cek otorisasi kepemilikan layanan
  const specificRole = getAdminSpecificRole(profile.email, profile.role ?? "");
  const isGeneralAdmin = specificRole === "admin_ptsp";

  if (!isSuper && !isGeneralAdmin && serviceData.roleOwner !== specificRole) {
    notFound();
  }

  const service = serializeBigInt(serviceData);

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
