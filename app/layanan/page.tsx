import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Layers3,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { ServicesFilter } from "@/components/services/services-filter";
import { getPublicServices } from "@/lib/queries";

export default async function ServicesPage() {
  const services = await getPublicServices();
  const totalItems = services.reduce(
    (acc: number, service: any) => acc + (service.serviceItems?.length ?? 0),
    0,
  );

  return (
    <div className="w-full overflow-hidden bg-slate-50/30">
      {/* Immersive Premium Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#064e3b] via-[#059669] to-[#047857] pt-24 pb-32 md:pt-32 md:pb-44 shadow-[0_20px_50px_-20px_rgba(4,120,87,0.4)]">
        {/* Subtle Grid & Glow */}
        <div
          className="absolute inset-0 opacity-[0.1]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, rgba(255,255,255,1) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-white/10 blur-[120px] animate-pulse" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-[#5eeaa5]/20 blur-[100px]" />

        <div className="relative z-10 mx-auto w-full px-6 sm:px-10 lg:px-20 xl:px-24">
          <div className="grid gap-12 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-4xl space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg backdrop-blur-md">
                <Sparkles className="h-4 w-4 text-[#5eeaa5]" />
                Katalog Layanan Digital
              </div>

              <h1 className="text-4xl font-black leading-[1.1] text-white sm:text-6xl md:text-7xl tracking-tight">
                Jelajahi Layanan <br className="hidden md:block" />
                <span className="text-emerald-300">
                  Kementerian Agama Kabupaten Barito Utara
                </span>
              </h1>

              <p className="max-w-2xl text-base leading-relaxed text-emerald-50/80 sm:text-xl font-medium mx-auto lg:mx-0">
                Pilih Unit Kerja, Cek Detail Persyaratan secara Transparan, dan
                Siapkan Dokumen Anda Sebelum Mengajukan secara Online.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/dashboard/pengajuan/baru"
                  className="inline-flex items-center gap-3 rounded-2xl bg-white px-8 py-4 text-[15px] font-black text-[#059669] shadow-2xl shadow-emerald-950/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-white/10 hover:bg-emerald-50 active:scale-95"
                >
                  Mulai Pengajuan <ArrowRight className="h-4 w-4" />
                </Link>
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i: number) => (
                    <div
                      key={i}
                      className="h-10 w-10 rounded-full border-2 border-[#059669] bg-emerald-100 flex items-center justify-center text-[10px] font-black text-[#059669]"
                    >
                      {i}
                    </div>
                  ))}
                  <div className="flex items-center justify-center h-10 px-4 rounded-full border-2 border-[#059669] bg-white text-[10px] font-black text-[#059669] translate-x-1">
                    +30 Layanan
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="flex flex-row lg:flex-col xl:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <div className="flex flex-1 flex-row lg:flex-col items-center lg:items-start gap-3 sm:gap-4 rounded-2xl sm:rounded-[2rem] border border-white/15 bg-white/10 p-3 sm:p-5 md:p-8 backdrop-blur-xl shadow-2xl">
                <div className="flex h-10 w-10 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-white/10 text-white shadow-inner">
                  <Building2 className="h-5 w-5 sm:h-7 sm:w-7" />
                </div>
                <div>
                  <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-200/60 leading-none">
                    Unit Kerja
                  </p>
                  <p className="text-2xl sm:text-4xl font-black text-white leading-none mt-1">
                    {services.length}
                  </p>
                </div>
              </div>
              <div className="flex flex-1 flex-row lg:flex-col items-center lg:items-start gap-3 sm:gap-4 rounded-2xl sm:rounded-[2rem] border border-white/15 bg-white/10 p-3 sm:p-5 md:p-8 backdrop-blur-xl shadow-2xl">
                <div className="flex h-10 w-10 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-white/10 text-emerald-300 shadow-inner">
                  <Layers3 className="h-5 w-5 sm:h-7 sm:w-7" />
                </div>
                <div>
                  <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-200/60 leading-none">
                    Total Layanan
                  </p>
                  <p className="text-2xl sm:text-4xl font-black text-white leading-none mt-1">
                    {totalItems}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="relative -mt-16 mb-32 px-6 sm:px-10 lg:px-20 xl:px-24">
        <div className="mx-auto w-full">
          <div className="rounded-[3rem] bg-white p-6 sm:p-10 md:p-12 shadow-[0_50px_100px_-20px_rgba(15,23,42,0.1)] border border-slate-100">
            <ServicesFilter services={services} />
          </div>
        </div>
      </section>
    </div>
  );
}
