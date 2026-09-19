import { ArrowLeft, Building2, Layers, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import Link from "@/lib/next-compat/link";
import { ServiceWizardClient } from "@/components/admin/layanan/service-wizard-client";

export function ServiceWizardView({
  service,
  isSuper,
}: {
  service: any;
  isSuper: boolean;
}) {
  const isActive = service?.is_active !== undefined ? Boolean(service.is_active) : (service?.isActive !== undefined ? Boolean(service.isActive) : true);

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Parent Service Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <Link
              href="/admin/layanan"
              className="inline-flex items-center justify-center p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 transition-all duration-200 group cursor-pointer shrink-0 mt-0.5"
              title="Kembali ke Daftar Layanan Induk"
            >
              <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            </Link>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Induk Layanan
                </span>
                {service?.category && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                    {service.category}
                  </span>
                )}
                {service?.roleOwner && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    <ShieldCheck className="h-3 w-3 text-slate-400" />
                    {service.roleOwner}
                  </span>
                )}
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                      : "bg-rose-50 text-rose-700 border border-rose-200/80"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-rose-500"}`} />
                  {isActive ? "Aktif" : "Nonaktif"}
                </span>
              </div>

              <h1 className="text-xl font-black text-slate-800 tracking-tight">
                {service?.name || "Detail Layanan"}
              </h1>

              {service?.description && (
                <p className="text-xs text-slate-500 mt-1 max-w-2xl line-clamp-2">
                  {service.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <span className="text-xs font-mono bg-slate-100 px-3 py-1 rounded-lg text-slate-600 border border-slate-200/70">
              /{service?.slug}
            </span>
          </div>
        </div>
      </div>

      <ServiceWizardClient initialService={service} isSuperAdmin={isSuper} />
    </div>
  );
}

export default ServiceWizardView;
