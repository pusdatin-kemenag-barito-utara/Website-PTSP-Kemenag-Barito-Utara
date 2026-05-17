import { requireAdmin } from "@/lib/auth";
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
  const profile = await requireAdmin();
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
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#059669] transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar Layanan
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
