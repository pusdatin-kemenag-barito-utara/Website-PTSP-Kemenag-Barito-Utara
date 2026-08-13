import { PageHeader } from "@/components/admin/page-header";
import { FolderOpen, ArrowLeft } from "lucide-react";
import Link from "@/lib/next-compat/link";
import { ServiceWizardClient } from "@/components/admin/layanan/service-wizard-client";

export function ServiceWizardView({
  service,
  isSuper,
}: {
  service: any;
  isSuper: boolean;
}) {
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

export default ServiceWizardView;
