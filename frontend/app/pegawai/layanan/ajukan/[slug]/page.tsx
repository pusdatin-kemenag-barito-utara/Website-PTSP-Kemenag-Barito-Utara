import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getServiceBySlug, getServiceCatalog } from "@/lib/queries";
import { ServiceItemsAccordion } from "@/components/services/service-items-accordion";
import { PegawaiUsulCutiForm } from "@/components/forms/pegawai/pegawai-usul-cuti-form";
import { PegawaiUsulPensiunForm } from "@/components/forms/pegawai/pegawai-usul-pensiun-form";
import { requireAuth, getCurrentProfile } from "@/lib/auth";
import { getSisaCutiByNip } from "@/lib/actions/pegawai/cuti";
import { getPejabatList } from "@/lib/actions/admin/pejabat-actions";

export default async function PegawaiServiceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireAuth();

  const { slug } = await params;
  const { item: initialItemId } = await searchParams;
  const service = await getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const items = service.serviceItems || (service as any).service_items || [];
  const serviceName = service.name?.toLowerCase() || "";
  const isCutiService = serviceName.includes("cuti");
  const isPensiunService = serviceName.includes("pensiun");

  if (isPensiunService) {
    const catalog = await getServiceCatalog();
    const profile = await getCurrentProfile();

    return (
      <div className="w-full space-y-4">
        <div>
          <Link
            href="/pegawai/layanan/ajukan"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-600 transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Daftar Layanan
          </Link>
        </div>

        <PegawaiUsulPensiunForm
          catalog={catalog}
          profile={profile}
          redirectPathPrefix="/pegawai/layanan/riwayat"
          lockedServiceId={String(service.id)}
        />
      </div>
    );
  }

  if (isCutiService) {
    const catalog = await getServiceCatalog();
    const profile = await getCurrentProfile();

    let pejabatList: any[] = [];
    try {
      const resPejabat = await getPejabatList();
      if (resPejabat.success) {
        pejabatList = resPejabat.data || [];
      }
    } catch {
      pejabatList = [];
    }

    let sisaCutiData = { n: "0", n1: "0", n2: "0" };
    const nip = profile?.email ? profile.email.split("@")[0] : null;
    if (nip) {
      try {
        sisaCutiData = await getSisaCutiByNip(nip);
      } catch (error) {
        console.error("Gagal mengambil data cuti:", error);
      }
    }

    return (
      <div className="w-full space-y-4">
        <div>
          <Link
            href="/pegawai/layanan/ajukan"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-600 transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Daftar Layanan
          </Link>
        </div>

        <PegawaiUsulCutiForm
          catalog={catalog}
          profile={profile}
          pejabatList={pejabatList}
          sisaCutiData={sisaCutiData}
          redirectPathPrefix="/pegawai/layanan/riwayat"
          lockedServiceId={String(service.id)}
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <Link
          href="/pegawai/layanan/ajukan"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-600 transition-colors mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar Layanan
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {service.name}
        </h1>
        {service.description && (
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {service.description}
          </p>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Pilih Sub-Layanan
        </h2>
        <ServiceItemsAccordion
          items={items}
          initialOpenId={initialItemId ? String(initialItemId) : undefined}
          basePath="/pegawai/layanan/riwayat"
        />

      </div>
    </div>
  );
}
