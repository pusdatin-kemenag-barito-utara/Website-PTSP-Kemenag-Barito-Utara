import { HomeSaranPengaduan } from "@/components/home/saran-pengaduan";
import PageBanner from "@/components/common/PageBanner";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "E-Pengaduan & Saran",
  description: "Sampaikan saran, masukan, maupun pengaduan terkait layanan PTSP Kementerian Agama Kabupaten Barito Utara.",
};

export default function EPengaduanPage() {
  return (
    <main className="min-h-screen bg-slate-50/50 pb-16">
      <PageBanner
        title="E-Pengaduan & Saran"
        description="Sampaikan saran, kritik, masukan, maupun pengaduan secara online. Laporan Anda sangat berarti untuk peningkatan kualitas layanan kami."
        breadcrumb={[
          { label: "Beranda", href: "/" },
          { label: "E-Pengaduan" },
        ]}
        eyebrow="LAYANAN PENGADUAN PUBLIK"
      />

      <div className="w-full pb-16">
        <HomeSaranPengaduan hideHeader={true} />
      </div>
    </main>
  );
}
