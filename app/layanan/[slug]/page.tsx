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
      <section className="relative overflow-hidden bg-gradient-to-br from-[#064e3b] via-[#059669] to-[#047857] pt-12 pb-20 md:pt-16 md:pb-28">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-white/10 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-[#f0c040]/20 blur-[100px]" />

        <div className="relative z-10 mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-emerald-200">
            <Link href="/" className="hover:text-white transition-colors">
              Beranda
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link
              href="/layanan"
              className="hover:text-white transition-colors"
            >
              Layanan
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white">{service.name}</span>
          </div>

          <div className="max-w-3xl">
            <Link
              href="/layanan"
              className="mb-5 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white shadow-sm backdrop-blur-md transition-all duration-200 hover:bg-white/20"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Katalog
            </Link>

            <h1 className="text-4xl font-black leading-tight text-white sm:text-5xl md:text-6xl">
              {service.name}
            </h1>
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
