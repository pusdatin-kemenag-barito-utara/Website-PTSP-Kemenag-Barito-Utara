import { HomeHero } from "@/components/home/hero";
import { HomeSambutanKepala } from "@/components/home/sambutan";
import { HomeAlurPengajuanMobile } from "@/components/home/alur-pengajuan-mobile";
import { HomeServiceCatalogSection } from "@/components/home/service-catalog";
import { HomeVideoProfile } from "@/components/home/video-profile";
import { BannerModal } from "@/components/home/banner-modal";
import { getPublicServices, getHomeVideos } from "@/lib/queries";
import { redirect } from "next/navigation";

// Cache Halaman Beranda selama 5 menit (300 detik) via Incremental Static Regeneration (ISR)
export const revalidate = 300;

export default async function HomePage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  if (searchParams?.code) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (typeof value === 'string') {
        query.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach(v => query.append(key, v));
      }
    }
    redirect(`/auth/callback?${query.toString()}`);
  }

  const [services, homeVideosData] = await Promise.all([
    getPublicServices(),
    getHomeVideos()
  ]);

  const { videos, totalCount } = homeVideosData;

  return (
    <div className="w-full overflow-x-hidden relative">
      <BannerModal />
      <HomeHero />
      <HomeSambutanKepala />
      <HomeAlurPengajuanMobile />

      {/* Modern Full-Width Glowing Gradient Divider: Sambutan to Catalog */}
      <div className="relative w-full h-8 bg-gradient-to-b from-[#f8fafc] via-[#f8fafc]/50 to-white dark:from-slate-950 dark:via-slate-950/50 dark:to-slate-950 flex items-center justify-center overflow-hidden transition-colors duration-300">
        <div className="w-full h-[3px] bg-gradient-to-r from-transparent via-emerald-500/80 dark:via-emerald-400/90 to-transparent shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
        <div className="absolute w-3/4 max-w-5xl h-8 bg-emerald-500/20 dark:bg-emerald-400/25 blur-2xl rounded-full pointer-events-none" />
      </div>

      <HomeServiceCatalogSection services={services} />

      {/* Modern Full-Width Glowing Gradient Divider: Catalog to Video Profile */}
      <div className="relative w-full h-8 bg-gradient-to-b from-white via-white/50 to-[#f8fafc] dark:from-slate-950 dark:via-slate-950/50 dark:to-slate-950 flex items-center justify-center overflow-hidden transition-colors duration-300">
        <div className="w-full h-[3px] bg-gradient-to-r from-transparent via-emerald-500/80 dark:via-emerald-400/90 to-transparent shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
        <div className="absolute w-3/4 max-w-5xl h-8 bg-emerald-500/20 dark:bg-emerald-400/25 blur-2xl rounded-full pointer-events-none" />
      </div>

      <HomeVideoProfile videos={videos} totalCount={totalCount} />
    </div>
  );
}
