import { Building2, Layers3 } from "lucide-react";
import { ServicesGridPegawai } from "@/components/services/services-grid-pegawai";
import { getEmployeeServices } from "@/lib/queries";
import PageBanner from "@/components/common/PageBanner";
import { MotionDiv, springPopVariants, staggerContainerVariants, fadeUpVariants } from "@/components/common/MotionDiv";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Katalog Layanan Pegawai",
  description: "Cari tahu jenis layanan pegawai, persyaratan, dan estimasi waktu proses dokumen di PTSP Kemenag Barito Utara.",
};

export default async function EmployeeServicesPage() {
  const services = await getEmployeeServices();
  const totalItems = services.length;

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
