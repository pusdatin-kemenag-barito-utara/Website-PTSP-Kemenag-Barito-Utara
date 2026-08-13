import Link from "@/lib/next-compat/link";
import Image from "@/lib/next-compat/image";
import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "@/lib/next-compat/navigation";
import { Search, Building2, Layers3, ArrowRight } from "lucide-react";

type Requirement = {
  id: string;
  documentName: string;
};

type ServiceItem = {
  id: number;
  name: string;
  serviceRequirements?: Requirement[];
};

type Service = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  serviceItems?: ServiceItem[];
  items?: ServiceItem[];
};

function normalize(text: string) {
  return text.toLowerCase().trim();
}

export function ServicesGrid({ services, totalItems = 0 }: { services: Service[], totalItems?: number }) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setQuery(q);
  }, [searchParams]);

  const filteredServices = useMemo(() => {
    const keyword = normalize(query);
    if (!keyword) return services;

    const orGroups = query
      .split(",")
      .map((g: string) => g.trim())
      .filter(Boolean);

    return services.filter((service: Service) => {
      return orGroups.some((group: string) => {
        const andKeywords = group.toLowerCase().split(/\s+/).filter(Boolean);
        return andKeywords.every(
          (k: string) =>
            service.name.toLowerCase().includes(k) ||
            (service.serviceItems ?? []).some(
              (item: ServiceItem) =>
                item.name.toLowerCase().includes(k) ||
                (item.serviceRequirements ?? []).some((r: Requirement) =>
                  r.documentName.toLowerCase().includes(k),
                ),
            ),
        );
      });
    });
  }, [services, query]);

  return (
    <div className="space-y-8">
      {/* Top Bar: Stats and Search */}
      <section className="relative z-10 w-full flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
        {/* Stats Section */}
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="flex items-center gap-4 rounded-2xl border border-emerald-500/10 dark:border-slate-800 bg-emerald-50/20 dark:bg-slate-900/60 p-4 shadow-sm backdrop-blur-md flex-1 lg:flex-none">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white shadow-md">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Unit Kerja</p>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{services.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-emerald-500/10 dark:border-slate-800 bg-emerald-50/20 dark:bg-slate-900/60 p-4 shadow-sm backdrop-blur-md flex-1 lg:flex-none">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white shadow-md">
              <Layers3 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Layanan</p>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{totalItems}</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="w-full lg:w-96 shrink-0">
          <div className="group relative flex items-center">
            <div className="pointer-events-none absolute left-4 sm:left-6 text-slate-400 dark:text-slate-500 transition-colors group-focus-within:text-[#059669]">
              <Search className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari unit atau layanan..."
              className="h-14 w-full rounded-2xl sm:rounded-3xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/90 pl-12 sm:pl-16 pr-4 sm:pr-6 text-sm sm:text-base font-bold text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm transition-all focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>
          <div className="mt-2 px-2">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {query ? (
                <span>
                  Hasil: <span className="text-emerald-600 dark:text-emerald-400">{filteredServices.length} Unit</span>
                </span>
              ) : (
                `Menampilkan ${services.length} Unit Utama`
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Grid Banners */}
      <section>
        {filteredServices.length === 0 ? (
          <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800">
            <div className="mx-auto h-20 w-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-slate-500 dark:text-slate-300 font-bold text-lg">
              Layanan tidak ditemukan
            </p>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
              Coba gunakan kata kunci yang lebih umum atau periksa ejaan Anda.
            </p>
            <button
              onClick={() => setQuery("")}
              className="mt-6 inline-flex items-center gap-2 text-[#059669] dark:text-emerald-400 text-sm font-black underline underline-offset-4 decoration-2 hover:text-emerald-700 transition-colors"
            >
              Reset Pencarian
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            {filteredServices.map((service: Service, idx: number) => (
              <Link
                key={service.id}
                href={`/layanan/${service.slug}`}
                className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-900/10 dark:hover:shadow-none transition-all duration-300"
              >
                {/* Banner Container */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-900 shrink-0">
                  {/* Fallback Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#064e3b] via-[#059669] to-[#047857] z-0 opacity-100 flex flex-col items-center justify-center p-4 text-center">
                    <Building2 className="h-8 w-8 text-white/80 mb-2" />
                    <span className="text-xs font-black text-white uppercase tracking-wider line-clamp-2">
                      {service.name}
                    </span>
                  </div>

                  {/* Actual Banner Image */}
                  <Image
                    src={`/banners/${service.slug}.png`}
                    alt={`Banner ${service.name}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    priority={idx < 4}
                    className="z-20 object-cover object-center opacity-100 transition-transform duration-500 group-hover:scale-[1.03]"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                    unoptimized
                  />

                  {/* Top Floating Pill Badge */}
                  <div className="absolute top-3 right-3 z-30 inline-flex items-center gap-1.5 rounded-full bg-slate-950/80 backdrop-blur-md px-3 py-1 text-[11px] font-black text-white border border-white/20 shadow-md">
                    <Layers3 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{(service.items ?? service.serviceItems)?.length ?? 0} Layanan</span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                      {service.name}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                      Klik untuk melihat rincian formulir & persyaratan
                    </p>
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center">
                    <span className="w-full text-center text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50/90 dark:bg-emerald-950/60 hover:bg-emerald-600 hover:text-white px-4 py-2 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/50 inline-flex items-center justify-center gap-2 transition-all duration-300 shadow-2xs group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 group-hover:shadow-md">
                      <span>Buka Katalog</span>
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5 animate-pulse" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
