import { Search, BookOpen, ArrowRight } from "lucide-react";
import Link from "@/lib/next-compat/link";
import { useState } from "react";

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
    <section className="py-8 sm:py-12 lg:py-14 relative overflow-hidden bg-slate-50/80 dark:bg-slate-950 transition-colors duration-300">
      <div className="w-full px-4 sm:px-6 lg:w-[90%] 2xl:w-[88%] max-w-[1536px] mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          {/* Left Side: Content */}
          <div className="w-full lg:w-[38%] xl:w-[34%] text-left space-y-4 sm:space-y-5 relative lg:sticky lg:top-32 z-20">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Katalog Layanan Digital
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
              Cari Tahu <span className="text-emerald-700 dark:text-emerald-400">Syarat</span> Layanan Anda
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
              Persiapkan dokumen Anda lebih awal. Cari jenis layanan keagamaan yang Anda butuhkan dan lihat rincian persyaratannya secara transparan.
            </p>

            {/* Clean Modern Search Bar */}
            <div className="relative max-w-xl">
              <form
                action="/layanan"
                method="get"
                className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 shadow-2xs focus-within:border-emerald-600 dark:focus-within:border-emerald-500 transition-colors"
              >
                <div className="flex items-center flex-1 px-2.5 sm:px-3">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                  <input
                    type="text"
                    name="q"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Contoh: Izin Madrasah, Rekomendasi Nikah..."
                    className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-slate-900 dark:text-white text-xs sm:text-sm font-medium placeholder:text-slate-400 py-2 px-2.5"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <span>Cari</span>
                  <ArrowRight className="h-3.5 w-3.5" />
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

            {/* View All Banner (Desktop Only) */}
            <div className="hidden lg:block pt-3 w-full">
              <Link
                href="/layanan"
                className="group flex flex-row items-center justify-between p-3.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors w-full border border-slate-800 dark:border-slate-700"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="h-8 w-8 shrink-0 rounded-lg bg-white/10 flex items-center justify-center text-emerald-400">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm text-white font-bold tracking-tight">
                      Lihat Seluruh Katalog Layanan
                    </h4>
                    <p className="text-slate-400 text-[10px] font-medium">
                      Jelajahi semua unit dan jenis perizinan
                    </p>
                  </div>
                </div>
                <div className="h-7 w-7 shrink-0 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            </div>
          </div>

          {/* Right Side: Category Cards Grid */}
          <div
            className="w-full lg:w-[62%] xl:w-[66%] grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4"
          >
            {displayServices.map((service: any) => {
              return (
                <div
                  key={service.id || service.name}
                  className="h-full"
                >
                  <Link
                    href={`/layanan/${service.slug}`}
                    className="group relative flex flex-col justify-end aspect-[3/4] overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-600 transition-all block shadow-2xs"
                  >
                    {/* Background Image */}
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{
                        backgroundImage: `url(/banners/${service.slug}.png)`,
                      }}
                    />

                    {/* Dark Gradient Overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/30 to-transparent" />

                    <div className="relative z-10 p-3 w-full">
                      <h4 className="text-xs font-bold text-white tracking-tight leading-snug line-clamp-2">
                        {service.name}
                      </h4>
                    </div>
                  </Link>
                </div>
              );
            })}

            {/* View All Card (Mobile/Tablet Only) */}
            <div className="col-span-2 sm:col-span-3 xl:col-span-4 pt-2 lg:hidden">
              <Link
                href="/layanan"
                className="group flex flex-row items-center justify-between p-3.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white transition-colors w-full border border-slate-800"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="h-8 w-8 shrink-0 rounded-lg bg-white/10 flex items-center justify-center text-emerald-400">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white tracking-tight">
                      Lihat Seluruh Katalog Layanan
                    </h4>
                    <p className="text-slate-400 text-[10px]">
                      Jelajahi semua unit dan layanan
                    </p>
                  </div>
                </div>
                <div className="h-7 w-7 shrink-0 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
