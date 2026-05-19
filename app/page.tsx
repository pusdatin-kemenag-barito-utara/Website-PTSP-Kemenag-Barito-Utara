import { HomeHero } from "@/components/home/hero";
import { HomeSambutanKepala } from "@/components/home/sambutan";
import { HomeAlurPengajuanMobile } from "@/components/home/alur-pengajuan-mobile";
import { HomeServiceCatalogSection } from "@/components/home/service-catalog";
import { HomeVideoProfile } from "@/components/home/video-profile";
import { HomeSaranPengaduan } from "@/components/home/saran-pengaduan";

export default async function HomePage() {
  return (
    <div className="w-full overflow-x-hidden">
      <HomeHero />
      <HomeSambutanKepala />
      <HomeAlurPengajuanMobile />

      {/* Modern Flat Horizontal Layered Divider: Sambutan to Catalog */}
      <div className="w-full bg-[#f8fafc] flex flex-col">
        <div className="w-full h-[6px] bg-[#10b981]/15" />
        <div className="w-full h-[3px] bg-[#10b981]" />
        <div className="w-full h-8 bg-white" />
      </div>

      <HomeServiceCatalogSection />

      {/* Modern Flat Horizontal Layered Divider: Catalog to Video Profile */}
      <div className="w-full bg-white flex flex-col">
        <div className="w-full h-[6px] bg-[#10b981]/15" />
        <div className="w-full h-[3px] bg-[#10b981]" />
        <div className="w-full h-8 bg-[#f8fafc]" />
      </div>

      <HomeVideoProfile />

      {/* Modern Flat Horizontal Layered Divider: Video Profile to Saran & Pengaduan */}
      <div className="w-full bg-[#f8fafc] flex flex-col">
        <div className="w-full h-[6px] bg-[#10b981]/15" />
        <div className="w-full h-[3px] bg-[#10b981]" />
        <div className="w-full h-8 bg-white" />
      </div>

      <HomeSaranPengaduan />
    </div>
  );
}
