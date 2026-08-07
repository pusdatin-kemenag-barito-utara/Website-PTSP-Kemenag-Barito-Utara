import PageBanner from "@/components/common/PageBanner";
import AppointmentClient from "./_components/appointment-client";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Janji Temu Online - PTSP Kemenag Barito Utara",
  description: "Buat janji temu online secara resmi dengan Kepala Kantor, Kasubag TU, atau Kepala Seksi/Kasi Kemenag Barito Utara.",
};

export default function AppointmentPage() {
  return (
    <main className="min-h-screen bg-slate-50/50 pb-16">
      <PageBanner
        title="Janji Temu Online"
        description="Buat janji temu secara terencana dengan pejabat atau pegawai di Kantor Kementerian Agama Kabupaten Barito Utara."
        breadcrumb={[
          { label: "Beranda", href: "/" },
          { label: "Janji Temu" },
        ]}
        eyebrow="PTSP KEMENAG BARITO UTARA"
      />
      <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20 py-8">
        <AppointmentClient />
      </div>
    </main>
  );
}
