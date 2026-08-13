import {
  Search,
  ChevronRight,
  BookOpen,
  GraduationCap,
  HeartHandshake,
  Building2,
  Users,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Link from "@/lib/next-compat/link";
import { useState } from "react";
import { motion, type Variants } from "framer-motion";

const popularCategories = [
  {
    name: "Penyelenggaraan Haji dan Umrah",
    icon: BookOpen,
    query: "Haji",
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  {
    name: "Pendidikan Islam",
    icon: GraduationCap,
    query: "Pendidikan",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    name: "Bimbingan Masyarakat",
    icon: Users,
    query: "Bimbingan, Hindu",
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
  {
    name: "Zakat & Wakaf",
    icon: HeartHandshake,
    query: "Zakat",
    color: "text-rose-500",
    bg: "bg-rose-50",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

export function HomeServiceCatalogSection({
  services = [],
}: {
  services?: any[];
}) {
  const [query, setQuery] = useState("");
  // If services is passed, take the first 8, otherwise fallback to empty array
  const displayServices = services.slice(0, 8);
  const popularSuggestions = displayServices.slice(0, 3).map((s: any) => s.name);

  return (
    <section className="py-12 md:py-16 relative overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[60%] rounded-full bg-emerald-50/50 dark:bg-emerald-950/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[50%] rounded-full bg-blue-50/30 dark:bg-blue-950/20 blur-[100px]" />
      </div>

      <div className="mx-auto w-full px-6 sm:px-10 lg:px-20 xl:px-24 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          {/* Left Side: Content */}
          <div className="w-full lg:w-[40%] text-center lg:text-left space-y-6 lg:space-y-8 relative lg:sticky lg:top-32 z-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/50 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                Katalog Layanan Digital
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-[1.1]">
              Cari Tahu <span className="text-emerald-600 dark:text-emerald-400">Syarat</span>{" "}
              <br className="hidden md:block" /> Layanan Anda
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
              Persiapkan dokumen Anda lebih awal. Cari jenis layanan keagamaan
              yang Anda butuhkan dan lihat rincian persyaratannya secara
              transparan.
            </p>

            {/* Modern Search Bar */}
            <div className="relative max-w-2xl mx-auto lg:mx-0 group">
              <div className="absolute inset-0 bg-emerald-600/5 dark:bg-emerald-500/10 rounded-[2rem] blur-2xl group-focus-within:bg-emerald-600/10 transition-all duration-500" />
              <form
                action="/layanan"
                method="get"
                className="relative flex items-center bg-white dark:bg-slate-900/90 border-2 border-slate-100 dark:border-slate-800/80 rounded-[2rem] p-1.5 sm:p-2 shadow-xl shadow-slate-200/50 dark:shadow-none group-focus-within:border-emerald-500/50 transition-all duration-500"
              >
                <div className="flex items-center flex-1 px-2 sm:px-4">
                  <Search className="h-5 w-5 sm:h-6 sm:w-6 text-slate-400 dark:text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="text"
                    name="q"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Contoh: Izin Madrasah..."
                    className="w-full bg-transparent border-none focus:outline-none focus:ring-0 focus:border-none text-slate-800 dark:text-white dark:bg-transparent text-sm sm:text-base font-bold placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-semibold py-2.5 px-2 sm:py-3 sm:px-3 shadow-none"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm sm:text-base px-5 py-2.5 sm:px-6 sm:py-3 rounded-3xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95 flex items-center gap-2"
                >
                  Cari <ArrowRight className="h-4 w-4 hidden sm:block" />
                </button>
              </form>
            </div>

            {/* Quick Suggestions */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-1">
                Populer:
              </span>
              {popularSuggestions.map((sugg: string) => (
                <Link
                  key={sugg}
                  href={`/layanan?q=${encodeURIComponent(sugg)}`}
                  className="text-[10px] font-bold text-slate-500 hover:text-emerald-600 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-all"
                >
                  {sugg}
                </Link>
              ))}
            </div>

            {/* View All Card (Desktop Only) */}
            <div className="hidden lg:block pt-4 w-full">
              <Link
                href="/layanan"
                className="group flex flex-row items-center justify-between p-3 sm:p-4 rounded-[1.25rem] bg-emerald-950 shadow-lg shadow-emerald-900/20 hover:bg-emerald-900 transition-all w-full"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="h-8 w-8 shrink-0 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base text-white font-black tracking-tight mb-0.5">
                      Lihat Seluruh Katalog Layanan
                    </h4>
                    <p className="text-emerald-400/80 text-[9px] font-bold uppercase tracking-widest">
                      Jelajahi Semua Unit & Layanan
                    </p>
                  </div>
                </div>
                <div className="h-8 w-8 shrink-0 rounded-full bg-emerald-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-md shadow-emerald-900/50">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            </div>
          </div>

          {/* Right Side: Category Cards Grid */}
          <div
            className="w-full lg:w-[60%] grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4"
          >
            {displayServices.map((service: any, idx: number) => {
              return (
                <div
                  key={service.id || service.name}
                  className="h-full"
                >
                  <Link
                    href={`/layanan/${service.slug}`}
                    className="group relative flex flex-col justify-end aspect-[3/4] sm:aspect-[3/4.2] overflow-hidden rounded-[1.5rem] bg-slate-100 dark:bg-slate-900 border-2 border-transparent hover:border-emerald-400/50 hover:shadow-xl hover:shadow-emerald-900/10 transition-all duration-500 hover:-translate-y-1 block"
                  >
                    {/* Background Image */}
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                      style={{
                        backgroundImage: `url(/banners/${service.slug}.png)`,
                      }}
                    />

                    {/* Dark Gradient Overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative z-10 p-3 sm:p-4 w-full">
                      <div className="mb-2 h-6 w-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-lg border border-white/10 group-hover:bg-emerald-500 group-hover:border-emerald-400 transition-colors duration-500">
                        <Building2 className="h-3 w-3" />
                      </div>
                      <h4 className="text-xs sm:text-sm font-black text-white tracking-tight leading-tight line-clamp-2 drop-shadow-md">
                        {service.name}
                      </h4>
                    </div>
                  </Link>
                </div>
              );
            })}

            {/* View All Card (Mobile/Tablet Only) */}
            <div className="col-span-2 sm:col-span-3 xl:col-span-4 pt-4 lg:hidden">
              <Link
                href="/layanan"
                className="group flex flex-row items-center justify-between p-3 sm:p-4 rounded-[1.25rem] bg-emerald-950 shadow-lg shadow-emerald-900/20 hover:bg-emerald-900 transition-all w-full"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="h-8 w-8 shrink-0 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base text-white font-black tracking-tight mb-0.5">
                      Lihat Seluruh Katalog Layanan
                    </h4>
                    <p className="text-emerald-400/80 text-[9px] font-bold uppercase tracking-widest">
                      Jelajahi Semua Unit & Layanan
                    </p>
                  </div>
                </div>
                <div className="h-8 w-8 shrink-0 rounded-full bg-emerald-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-md shadow-emerald-900/50">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
