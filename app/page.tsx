import { SiteHomeFaq } from "@/components/site-home-faq";
import { HomeHero } from "@/components/home-hero";
import { HomeQuickAccess } from "@/components/home-quick-access";
import { HomeTrackSection } from "@/components/home-track-section";
import { HomeHowItWorks } from "@/components/home-how-it-works";
import { Zap, BookOpenCheck } from "lucide-react";

export default async function HomePage() {
  return (
    <div className="w-full overflow-x-hidden">
      <HomeHero />
      <HomeQuickAccess />

      {/* Divider: Quick Access to Track */}
      <div className="relative h-16 w-full overflow-hidden bg-[#f8fafc]">
        <svg
          viewBox="0 0 1440 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute bottom-0 w-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 32C240 64 480 0 720 32C960 64 1200 0 1440 32V64H0V32Z"
            fill="white"
          />
        </svg>
      </div>

      <HomeTrackSection />

      {/* Divider: Track to How It Works */}
      <div className="relative -mt-1 h-20 w-full overflow-hidden bg-white">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 0C360 80 720 0 1080 80C1440 160 1440 0 1440 0H0Z"
            fill="#f8fafc"
            className="opacity-50"
          />
          <path
            d="M0 0C360 40 720 0 1080 40C1440 80 1440 0 1440 0H0Z"
            fill="#f1f5f9"
          />
        </svg>
      </div>

      <HomeHowItWorks />

      {/* FAQ SECTION */}
      <section className="bg-[#f8fafc] py-16 md:py-24">
        <div className="mx-auto w-full px-6 sm:px-10 lg:px-20 xl:px-24">
          <div className="mb-16 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#1f4bb7]/10 px-4 py-1.5">
              <BookOpenCheck className="h-3.5 w-3.5 text-[#1f4bb7]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#1f4bb7]">
                FAQ
              </span>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
              Pertanyaan Umum
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-slate-500 md:text-base leading-relaxed">
              Jawaban atas pertanyaan yang sering diajukan untuk memudahkan
              proses layanan Anda.
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
