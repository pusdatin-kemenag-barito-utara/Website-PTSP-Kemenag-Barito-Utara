import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getServiceBySlug, getServiceCatalog } from "@/lib/queries";
import { ServiceItemsAccordion } from "@/components/services/service-items-accordion";
import { PegawaiUsulCutiForm } from "@/components/forms/pegawai/pegawai-usul-cuti-form";
import { PegawaiUsulPensiunForm } from "@/components/forms/pegawai/pegawai-usul-pensiun-form";
import { requireAuth, getCurrentProfile } from "@/lib/auth";
import { db } from "@/lib/db";
import { dataCutiPegawai, rekapCutiTahunan } from "@/lib/db/schema/kepegawaian";
import { dataPejabat } from "@/lib/db/schema/pejabat";
import { eq } from "drizzle-orm";

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

  // Robustly handle both camelCase and snake_case from Drizzle/DB
  const items = service.serviceItems || (service as any).service_items || [];
  const serviceName = service.name?.toLowerCase() || "";
  const isCutiService = serviceName.includes("cuti");
  const isPensiunService = serviceName.includes("pensiun");

  // For Pensiun services: show the custom pensiun form
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

  // For Cuti services: show the form directly with jenis cuti tabs
  if (isCutiService) {
    const catalog = await getServiceCatalog();
    const profile = await getCurrentProfile();
    const pusdatinPejabat = await db.query.profilesPegawai.findMany({
      where: (pp, { isNotNull }) => isNotNull(pp.tipePejabat),
      with: {
        profile: {
          columns: { fullName: true }
        }
      }
    });

    const pejabatList = pusdatinPejabat.map(p => ({
      tipePejabat: p.tipePejabat,
      unitKerja: p.unitKerja,
      nama: p.profile?.fullName || "",
      nip: p.nip || "",
      jabatan: p.jabatan || ""
    }));

    let sisaCutiData = { n: "0", n1: "0", n2: "0" };

    // Ambil data sisa cuti jika punya NIP
    const nip = profile?.email ? profile.email.split("@")[0] : null;
    if (nip) {
      try {
        const cutiPegawai = await db.query.dataCutiPegawai.findFirst({
          where: eq(dataCutiPegawai.nip, nip),
        });

        if (cutiPegawai) {
          const currentYear = new Date().getFullYear();
          const rekapList = await db.query.rekapCutiTahunan.findMany({
            where: eq(rekapCutiTahunan.pegawaiId, cutiPegawai.id),
          });

          const n = rekapList.find((r) => r.tahunTarget === currentYear)?.sisaCuti || 0;
          const n1 = rekapList.find((r) => r.tahunTarget === currentYear - 1)?.sisaCuti || 0;
          const n2 = rekapList.find((r) => r.tahunTarget === currentYear - 2)?.sisaCuti || 0;
          
          sisaCutiData = { n: String(n), n1: String(n1), n2: String(n2) };
        }
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
          redirectPathPrefix="/pegawai/layanan/riwayat"
          lockedServiceId={String(service.id)}
          sisaCutiData={sisaCutiData}
          pejabatList={pejabatList}
        />
      </div>
    );
  }

  // For non-Cuti services: show the accordion as usual
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/pegawai/layanan/ajukan"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-emerald-600 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar Layanan
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
          {service.name}
        </h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">
          {service.description || "Pilih jenis formulir yang ingin Anda ajukan."}
        </p>
      </div>

      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm">
        <ServiceItemsAccordion
          items={items}
          initialOpenId={initialItemId as string}
          basePath="/pegawai/layanan/ajukan/baru"
        />
      </div>
    </div>
  );
}
