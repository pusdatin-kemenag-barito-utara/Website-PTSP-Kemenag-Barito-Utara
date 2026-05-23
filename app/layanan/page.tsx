import { Building2, Layers3 } from "lucide-react";
import { ServicesFilter } from "@/components/services/services-filter";
import { getPublicServices } from "@/lib/queries";
import PageBanner from "@/components/common/PageBanner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Katalog Jenis Layanan",
  description: "Cari tahu jenis layanan publik, persyaratan, biaya, dan estimasi waktu proses dokumen di PTSP Kemenag Barito Utara.",
};

export default async function ServicesPage() {
  const services = await getPublicServices();
  const totalItems = services.reduce(
    (acc: number, service: any) => acc + (service.serviceItems?.length ?? 0),
    0,
  );

  return (
    <main className="min-h-screen bg-slate-50/50 pb-16">
      <PageBanner
        title="Katalog Layanan Digital"
        description="Pilih Unit Kerja, Cek Detail Persyaratan secara Transparan, dan Siapkan Dokumen Anda Sebelum Mengajukan secara Online."
        breadcrumb={[
          { label: "Beranda", href: "/" },
          { label: "Jenis Layanan" },
        ]}
        eyebrow="PTSP KEMENAG BARITO UTARA"
      />

      <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20 py-8 space-y-8">
        {/* Sleek Premium Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          <div className="flex items-center gap-4 rounded-2xl border border-emerald-500/10 bg-emerald-50/20 p-4 shadow-sm backdrop-blur-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Unit Kerja</p>
              <p className="text-2xl font-black text-slate-800">{services.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-emerald-500/10 bg-emerald-50/20 p-4 shadow-sm backdrop-blur-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md">
              <Layers3 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Layanan</p>
              <p className="text-2xl font-black text-slate-800">{totalItems}</p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="rounded-3xl bg-white p-6 sm:p-10 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.05)] border border-slate-100">
          <ServicesFilter services={services} />
        </div>
      </div>
    </main>
  );
}
