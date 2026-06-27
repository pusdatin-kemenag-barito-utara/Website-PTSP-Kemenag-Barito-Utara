import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getServiceBySlug } from "@/lib/queries";
import { ServiceItemsAccordion } from "@/components/services/service-items-accordion";
import { RealtimeSync } from "@/components/ui/realtime-sync";

export default async function ServiceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const { item: initialItemId } = await searchParams;
  const service = await getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  // Robustly handle both camelCase and snake_case from Drizzle/DB
  const items = service.serviceItems || (service as any).service_items || [];

  return (
    <div className="w-full overflow-hidden">
      <RealtimeSync />
      {/* Immersive Header */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-40 bg-slate-950">
        {/* Blurred Background Image */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 blur-[100px] scale-125"
            style={{ backgroundImage: `url(/banners/${service.slug}.png)` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-950/60 to-slate-950/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/layanan"
            className="mb-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-xs font-bold tracking-wider uppercase text-white shadow-sm backdrop-blur-md transition-all hover:bg-white/20 border border-white/10"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Katalog
          </Link>

          <div className="flex flex-col md:flex-row md:items-start gap-8 md:gap-10 lg:gap-16">
            
            {/* Left Poster Card (Desktop & Tablet) */}
            <div className="w-48 sm:w-56 md:w-72 lg:w-80 shrink-0 hidden md:block group">
              <div className="relative aspect-[4/5] w-full rounded-3xl overflow-hidden border-2 border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] rotate-[-3deg] hover:rotate-0 transition-transform duration-500 ease-out">
                {/* Fallback Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#064e3b] via-[#059669] to-[#047857] flex items-center justify-center">
                  <span className="text-white/20 font-black text-2xl uppercase tracking-widest text-center px-4 leading-tight">{service.name.split(" ")[0]}</span>
                </div>
                {/* Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center z-10"
                  style={{ backgroundImage: `url(/banners/${service.slug}.png)` }}
                />
                
                {/* Lighting Effect */}
                <div className="absolute inset-0 z-20 bg-gradient-to-tr from-black/40 via-transparent to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>

            {/* Right Content */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="mb-4 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                <Link href="/" className="hover:text-emerald-300 transition-colors">Beranda</Link>
                <ChevronRight className="h-3 w-3" />
                <Link href="/layanan" className="hover:text-emerald-300 transition-colors">Layanan</Link>
              </div>

              {/* Mobile Flex Layout (Visible only on mobile) */}
              <div className="flex md:hidden items-stretch gap-4 sm:gap-6 mb-6">
                
                {/* Left Side: Title, Desc, Total */}
                <div className="flex-1 flex flex-col justify-center">
                  <h1 className="text-2xl font-black leading-tight text-white sm:text-3xl drop-shadow-lg mb-3 tracking-tight">
                    {service.name}
                  </h1>
                  
                  <p className="text-slate-300 text-[10px] sm:text-xs leading-relaxed font-medium mb-4 line-clamp-4">
                    {service.description || "Temukan informasi lengkap mengenai persyaratan, prosedur, dan estimasi waktu untuk berbagai layanan yang disediakan oleh unit kerja ini."}
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                     <div className="px-3 py-2 sm:px-4 sm:py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white flex items-center gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Layanan</p>
                          <p className="text-sm sm:text-lg font-black">{items.length} <span className="text-[8px] sm:text-[10px] font-medium text-slate-400">Tersedia</span></p>
                        </div>
                     </div>
                  </div>
                </div>

                {/* Right Side: Banner */}
                <div className="w-24 sm:w-32 shrink-0 group self-center">
                  <div className="relative aspect-[4/5] w-full rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 shadow-2xl rotate-2 transition-transform duration-500 ease-out">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#064e3b] via-[#059669] to-[#047857] flex items-center justify-center">
                      <span className="text-white/20 font-black text-xs sm:text-sm uppercase tracking-widest text-center px-2 leading-tight">{service.name.split(" ")[0]}</span>
                    </div>
                    <div 
                      className="absolute inset-0 bg-cover bg-center z-10"
                      style={{ backgroundImage: `url(/banners/${service.slug}.png)` }}
                    />
                    <div className="absolute inset-0 z-20 bg-gradient-to-tr from-black/40 via-transparent to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </div>
              </div>

              {/* Desktop Layout (Hidden on mobile) */}
              <div className="hidden md:block">
                <h1 className="text-4xl font-black leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl drop-shadow-lg mb-6 tracking-tight">
                  {service.name}
                </h1>
                
                <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl font-medium">
                  {service.description || "Temukan informasi lengkap mengenai persyaratan, prosedur, dan estimasi waktu untuk berbagai layanan yang disediakan oleh unit kerja ini. Kami berkomitmen memberikan pelayanan publik yang transparan, mudah, dan akuntabel."}
                </p>

                <div className="mt-8 md:mt-10 flex flex-wrap items-center gap-4">
                   <div className="px-5 py-3 md:px-6 md:py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-white flex items-center gap-4">
                      <div className="p-2.5 md:p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Layanan</p>
                        <p className="text-xl md:text-2xl font-black">{items.length} <span className="text-xs md:text-sm font-medium text-slate-400">Tersedia</span></p>
                      </div>
                   </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="relative -mt-10 mb-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full">
          <div className="space-y-5">
            <ServiceItemsAccordion
              items={items}
              initialOpenId={initialItemId as string}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
