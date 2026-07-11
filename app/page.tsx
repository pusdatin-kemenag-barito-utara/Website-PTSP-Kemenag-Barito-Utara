import { HomeHero } from "@/components/home/hero";
import { HomeSambutanKepala } from "@/components/home/sambutan";
import { HomeAlurPengajuanMobile } from "@/components/home/alur-pengajuan-mobile";
import { HomeServiceCatalogSection } from "@/components/home/service-catalog";
import { HomeVideoProfile } from "@/components/home/video-profile";
import { getPublicServices } from "@/lib/queries";
import { redirect } from "next/navigation";

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

  const services = await getPublicServices();

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

      <HomeServiceCatalogSection services={services} />

      {/* Modern Flat Horizontal Layered Divider: Catalog to Video Profile */}
      <div className="w-full bg-white flex flex-col">
        <div className="w-full h-[6px] bg-[#10b981]/15" />
        <div className="w-full h-[3px] bg-[#10b981]" />
        <div className="w-full h-8 bg-[#f8fafc]" />
      </div>

      <HomeVideoProfile />
    </div>
  );
}
