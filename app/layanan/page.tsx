import { Building2, Layers3 } from "lucide-react";
import { ServicesGrid } from "@/components/services/services-grid";
import { getPublicServices } from "@/lib/queries";
import PageBanner from "@/components/common/PageBanner";
import { MotionDiv, springPopVariants, staggerContainerVariants, fadeUpVariants } from "@/components/common/MotionDiv";
import type { Metadata } from "next";
import { Suspense } from "react";

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
        title="Katalog Layanan Masyarakat Digital"
        description="Pilih Unit Kerja, Cek Detail Persyaratan secara Transparan, dan Siapkan Dokumen Anda Sebelum Mengajukan secara Online."
        breadcrumb={[
          { label: "Beranda", href: "/" },
          { label: "Jenis Layanan" },
        ]}
        eyebrow="PTSP KEMENAG BARITO UTARA"
      />

      <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20 py-8 space-y-8">
        {/* Main Content Area */}
        <MotionDiv 
          variants={fadeUpVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="rounded-3xl bg-gradient-to-br from-white via-emerald-50/20 to-slate-50/50 p-6 sm:p-10 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.1)] border border-slate-200/60 backdrop-blur-sm"
        >
          <Suspense fallback={<div className="py-20 text-center text-slate-400">Memuat layanan...</div>}>
            <ServicesGrid services={services} totalItems={totalItems} />
          </Suspense>
        </MotionDiv>
      </div>
    </main>
  );
}
