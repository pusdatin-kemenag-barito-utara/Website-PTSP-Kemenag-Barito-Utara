import { SiteHomeFaq } from "@/components/home/faq";
import { HomeHero } from "@/components/home/hero";
import { HomeQuickAccess } from "@/components/home/quick-access";
import { HomeServiceCatalogSection } from "@/components/home/service-catalog";
import { HomeHowItWorks } from "@/components/home/how-it-works";
import { BookOpenCheck } from "lucide-react";

export default async function HomePage() {
  return (
    <div className="w-full overflow-x-hidden">
      <HomeHero />
      <HomeQuickAccess />

      {/* Modern Divider: Quick Access to Catalog */}
      <div className="relative h-24 w-full bg-slate-50/50 overflow-hidden">
        <svg
          viewBox="0 0 1440 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute bottom-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 50C240 100 480 0 720 50C960 100 1200 0 1440 50V100H0V50Z"
            fill="#059669"
            fillOpacity="0.05"
          />
          <path
            d="M0 80C360 120 720 40 1080 80C1440 120 1440 80 1440 80V100H0V80Z"
            fill="#064e3b"
          />
        </svg>
      </div>

      <HomeServiceCatalogSection />

      {/* Modern Divider: Track to How It Works */}
      <div className="relative h-24 w-full bg-[#047857] overflow-hidden">
        <svg
          viewBox="0 0 1440 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute top-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 0H1440V20C1080 60 720 -20 360 20C180 40 0 20 0 20V0Z"
            fill="#047857"
          />
          <path
            d="M0 0H1440V40C1080 80 720 0 360 40C180 60 0 40 0 40V0Z"
            fill="white"
          />
        </svg>
      </div>

      <HomeHowItWorks />

      {/* Modern Divider: How It Works to FAQ */}
      <div className="relative h-24 w-full bg-white overflow-hidden">
        <svg
          viewBox="0 0 1440 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute bottom-0 w-full h-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 100C360 60 720 100 1080 60C1440 20 1440 100 1440 100H0Z"
            fill="#f8fafc"
          />
        </svg>
      </div>

      {/* FAQ SECTION */}
      <section className="bg-[#f8fafc] py-20 md:py-32">
        <div className="mx-auto w-full px-6 sm:px-10 lg:px-20 xl:px-24">
          <div className="mb-20 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 border border-emerald-100">
              <BookOpenCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
                FAQ
              </span>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl lg:text-5xl">
              Pertanyaan <span className="text-emerald-600">Umum</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-500 md:text-base leading-relaxed font-medium">
              Temukan jawaban cepat atas kendala yang sering ditanyakan untuk memudahkan
              proses administrasi layanan Anda.
            </p>
          </div>
          <div className="mx-auto max-w-4xl">
            <SiteHomeFaq />
          </div>
        </div>
      </section>
    </div>
  );
}
