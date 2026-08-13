import { Suspense } from "react";
import PageBanner from "@/components/common/PageBanner";
import { ServicesGridPegawai } from "@/components/services/services-grid-pegawai";
import { MotionDiv, fadeUpVariants } from "@/components/common/MotionDiv";

export function ServicesCatalogPegawaiView({
  services,
  totalItems,
}: {
  services: any[];
  totalItems: number;
}) {
  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300 pb-16">
      <PageBanner
        title="Katalog Layanan Pegawai Digital"
        description="Cek Detail Persyaratan secara Transparan, dan Siapkan Dokumen Anda Sebelum Mengajukan secara Online."
        breadcrumb={[
          { label: "Beranda", href: "/" },
          { label: "Layanan Pegawai" },
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
          className="rounded-3xl bg-gradient-to-br from-white via-emerald-50/20 to-slate-50/50 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 p-6 sm:p-10 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.1)] dark:shadow-none border border-slate-200/60 dark:border-slate-800 backdrop-blur-sm transition-colors duration-300"
        >
          <Suspense fallback={<div className="py-20 text-center text-slate-400 dark:text-slate-500 font-medium">Memuat layanan...</div>}>
            <ServicesGridPegawai services={services} totalItems={totalItems} />
          </Suspense>
        </MotionDiv>
      </div>
    </main>
  );
}

export default ServicesCatalogPegawaiView;