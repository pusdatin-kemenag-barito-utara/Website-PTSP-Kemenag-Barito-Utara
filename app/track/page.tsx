import { getPublicRequestStatus } from "@/lib/actions/public/public-track";
import { RealtimeSync } from "@/components/ui/realtime-sync";
import PageBanner from "@/components/common/PageBanner";
import { MotionDiv, fadeUpVariants, springPopVariants } from "@/components/common/MotionDiv";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lacak Permohonan Layanan",
  description: "Lacak status permohonan dokumen administrasi keagamaan Anda secara real-time dan transparan di Kemenag Barito Utara.",
};

// Local Components
import { TrackSearchForm } from "./_components/track-search-form";
import { TrackEmptyState } from "./_components/track-empty-state";
import { TrackErrorState } from "./_components/track-error-state";
import { TrackResultCard } from "./_components/track-result-card";

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; token?: string }>;
}) {
  const { q = "", token = "" } = await searchParams;
  // Hanya lakukan pencarian jika ada query (q) DAN token turnstile
  const result = q && token ? await getPublicRequestStatus(q, token) : null;

  return (
    <main className="relative min-h-screen bg-slate-50/50 pb-20 overflow-hidden">
      {/* Decorative Premium Blur Gradients */}
      <div className="absolute top-[10%] left-1/4 w-[450px] h-[450px] bg-emerald-500/[0.04] rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[30%] right-1/4 w-[350px] h-[350px] bg-teal-500/[0.03] rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] left-1/3 w-[500px] h-[500px] bg-emerald-600/[0.02] rounded-full blur-[130px] pointer-events-none -z-10" />

      <PageBanner
        title="Lacak Permohonan Layanan"
        description="Masukkan nomor registrasi permohonan Anda untuk melacak status proses dokumen dan riwayat persetujuan secara real-time."
        breadcrumb={[
          { label: "Beranda", href: "/" },
          { label: "Lacak Layanan" },
        ]}
        eyebrow="PORTAL PELACAKAN PUBLIK"
      />

      <RealtimeSync />
      
      <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20 py-8 relative z-10">
        <div className="mx-auto max-w-4xl space-y-6">
          <MotionDiv
            variants={springPopVariants}
            initial="hidden"
            animate="show"
          >
            <TrackSearchForm initialQuery={q} />
          </MotionDiv>

          {/* Result Section */}
          <MotionDiv 
            variants={fadeUpVariants}
            initial="hidden"
            animate="show"
            key={`${q}-${token}`} // Remounts when query or token changes
            className="transition-all duration-300"
          >
            {!(q && token) ? (
              <TrackEmptyState />
            ) : result?.error ? (
              <TrackErrorState message={result.error} />
            ) : result?.data ? (
              <TrackResultCard data={result.data} />
            ) : null}
          </MotionDiv>
        </div>
      </div>
    </main>
  );
}
