"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Building2, Layers3 } from "lucide-react";

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
          <div className="flex items-center gap-4 rounded-2xl border border-emerald-500/10 bg-emerald-50/20 p-4 shadow-sm backdrop-blur-md flex-1 lg:flex-none">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Unit Kerja</p>
              <p className="text-2xl font-black text-slate-800">{services.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-emerald-500/10 bg-emerald-50/20 p-4 shadow-sm backdrop-blur-md flex-1 lg:flex-none">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md">
              <Layers3 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Layanan</p>
              <p className="text-2xl font-black text-slate-800">{totalItems}</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="w-full lg:w-96 shrink-0">
          <div className="group relative flex items-center">
            <div className="pointer-events-none absolute left-4 sm:left-6 text-slate-400 transition-colors group-focus-within:text-[#059669]">
              <Search className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari unit atau layanan..."
              className="h-14 w-full rounded-2xl sm:rounded-3xl border-2 border-slate-100 bg-white pl-12 sm:pl-16 pr-4 sm:pr-6 text-sm sm:text-base text-slate-700 shadow-sm transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>
          <div className="mt-2 px-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {query ? (
                <span>
                  Hasil: <span className="text-emerald-600">{filteredServices.length} Unit</span>
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
          <div className="py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
            <div className="mx-auto h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-bold text-lg">
              Layanan tidak ditemukan
            </p>
            <p className="text-slate-400 text-sm mt-1">
              Coba gunakan kata kunci yang lebih umum atau periksa ejaan Anda.
            </p>
            <button
              onClick={() => setQuery("")}
              className="mt-6 inline-flex items-center gap-2 text-[#059669] text-sm font-black underline underline-offset-4 decoration-2 hover:text-emerald-700 transition-colors"
            >
              Reset Pencarian
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 sm:gap-6">
            {filteredServices.map((service: Service, idx: number) => (
              <Link
                key={service.id}
                href={`/layanan/${service.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-slate-200/60 bg-white shadow-md shadow-slate-200/50 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-900/10 transition-all duration-300 aspect-[4/5]"
              >
                {/* Fallback Background (Gradient) */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#064e3b] via-[#059669] to-[#047857] z-0 opacity-100 transition-opacity group-hover:opacity-90" />
                
                {/* Text overlay for fallback */}
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md text-white shadow-xl">
                    <Building2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-black text-white leading-tight mb-2 drop-shadow-md uppercase">
                    {service.name}
                  </h3>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                    <Layers3 className="h-3.5 w-3.5" />
                    {service.serviceItems?.length ?? 0} Layanan
                  </div>
                </div>

                {/* Actual Banner Image */}
                <Image
                  src={`/banners/${service.slug}.png`}
                  alt={`Banner ${service.name}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="z-20 object-cover opacity-100 transition-transform duration-500 group-hover:scale-[1.02]"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                  unoptimized
                />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
