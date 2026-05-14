import { requireAdmin } from "@/lib/auth";
import prisma, { serializeBigInt } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ServiceWizardClient } from "@/components/admin/layanan/service-wizard-client";
import { PageHeader } from "@/components/admin/page-header";
import { FolderOpen, ArrowLeft } from "lucide-react";
import { isSuperAdmin } from "@/lib/constants";
import Link from "next/link";

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
  const serviceData = await prisma.services.findUnique({
    where: { id: BigInt(id) },
    include: {
      service_items: {
        // @ts-ignore
        orderBy: { sort_order: "asc" },
        include: {
          service_form_fields: {
            orderBy: { sort_order: "asc" },
          },
          service_requirements: {
            orderBy: [
              // @ts-ignore
              { sort_order: "asc" },
              { id: "asc" }
            ],
          },
        },
      },
    },
  });

  if (!serviceData) {
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

      <ServiceWizardClient 
        initialService={service} 
        isSuperAdmin={isSuper}
      />
    </div>
  );
}
