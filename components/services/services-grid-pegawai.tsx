"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Layers3, FolderOpen, ArrowRightCircle, FileText, X, ExternalLink } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

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
  requirementsText?: string | null;
  sopUrl?: string | null;
  serviceItems?: ServiceItem[];
};

export function ServicesGridPegawai({ services, totalItems = 0 }: { services: Service[], totalItems?: number }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Modal state
  const [selectedRequirements, setSelectedRequirements] = useState<Service | null>(null);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setQuery(q);
  }, [searchParams]);

  const filteredServices = useMemo(() => {
    const keyword = query.toLowerCase().trim();
    if (!keyword) return services;

    const orGroups = keyword.split(",").map((g) => g.trim()).filter(Boolean);

    return services.filter((service) => {
      return orGroups.some((group) => {
        const andKeywords = group.split(/\s+/).filter(Boolean);
        return andKeywords.every(
          (k) =>
            service.name.toLowerCase().includes(k) ||
            (service.serviceItems ?? []).some(
              (item) =>
                item.name.toLowerCase().includes(k) ||
                (item.serviceRequirements ?? []).some((r) =>
                  r.documentName.toLowerCase().includes(k)
                )
            )
        );
      });
    });
  }, [services, query]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    
    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    let closestIndex = 0;
    let minDistance = Infinity;

    Array.from(container.children).forEach((child, index) => {
      const childElement = child as HTMLElement;
      const childCenter = childElement.offsetLeft + childElement.clientWidth / 2 - container.offsetLeft;
      const distance = Math.abs(childCenter - containerCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== activeIndex) {
      setActiveIndex(closestIndex);
    }
  };

  const handleApply = (service: Service) => {
    localStorage.setItem("selectedPegawaiServiceId", String(service.id));
    router.push("/login/pegawai?callbackUrl=/pegawai/layanan/ajukan");
  };

  return (
    <div className="space-y-8">
      {/* Top Bar: Stats and Search */}
      <section className="relative z-10 w-full flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
        {/* Stats Section */}
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
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
              placeholder="Cari kategori atau layanan..."
              className="h-14 w-full rounded-2xl sm:rounded-3xl border-2 border-slate-100 bg-white pl-12 sm:pl-16 pr-4 sm:pr-6 text-sm sm:text-base text-slate-700 shadow-sm transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>
          <div className="mt-2 px-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {query ? (
                <span>
                  Hasil: <span className="text-emerald-600">{filteredServices.length} Kategori</span>
                </span>
              ) : (
                `Menampilkan ${services.length} Kategori Utama`
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Grid of Categories (No Banner Images) */}
      <section>
        {filteredServices.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
            <div className="mx-auto h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-bold text-lg">
              Kategori tidak ditemukan
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
          <div className="flex flex-col">
            <div 
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 md:grid md:grid-cols-2 xl:grid-cols-3 md:gap-6 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {filteredServices.map((service, index) => (
                <div key={service.id} className="w-[85vw] max-w-[340px] shrink-0 snap-center md:w-auto md:max-w-none md:shrink h-full">
                  <m.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                    className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-slate-200/60 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300/50 hover:shadow-[0_20px_40px_rgb(5,150,105,0.1)] relative"
                  >
                    {/* Decorative Header */}
                    <div className="h-2 w-full bg-gradient-to-r from-emerald-500 to-teal-400" />

                    <div className="flex flex-1 flex-col p-6">
                      <div className="mb-6 flex flex-col items-center justify-center gap-4 text-center mt-2">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100/50 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                          <FolderOpen className="h-7 w-7" />
                        </div>
                        <div className="flex-1 w-full">
                          <h3 className="text-lg font-black leading-tight text-slate-800 transition-colors duration-300 group-hover:text-emerald-700">
                            {service.name}
                          </h3>
                        </div>
                      </div>

                      {service.description && (
                        <p className="text-sm font-medium leading-relaxed text-slate-500 line-clamp-2 flex-1 mb-6 text-center">
                          {service.description}
                        </p>
                      )}

                      <div className="flex flex-col gap-2 border-t border-slate-100 pt-4 mt-auto">
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedRequirements(service);
                          }}
                          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-all duration-300 w-full justify-center"
                        >
                          Persyaratan Berkas & SOP <FileText className="h-4 w-4" />
                        </button>
                        
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleApply(service);
                          }}
                          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-500/20 hover:bg-emerald-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 w-full justify-center"
                        >
                          Ajukan Layanan <ArrowRightCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </m.div>
                </div>
              ))}
            </div>
            
            {/* Pagination Dots (Mobile Only) */}
            {filteredServices.length > 1 && (
              <div className="mt-4 flex md:hidden items-center justify-center flex-wrap gap-1.5 px-4">
                {filteredServices.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeIndex === idx 
                        ? "w-5 bg-[#059669]" 
                        : "w-1.5 bg-slate-200"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Floating Modal for Requirements & SOP */}
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {selectedRequirements && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
              <m.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedRequirements(null)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              <m.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl border border-slate-200/60 overflow-hidden flex flex-col max-h-[85vh]"
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10">
                  <h3 className="text-lg font-black text-slate-800">
                    Persyaratan {selectedRequirements.name}
                  </h3>
                  <button
                    onClick={() => setSelectedRequirements(null)}
                    className="p-2 rounded-xl hover:bg-slate-200/50 text-slate-400 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
                  {!selectedRequirements.requirementsText && !selectedRequirements.sopUrl ? (
                    <div className="text-center py-8">
                      <p className="text-slate-500 font-medium">Belum ada data persyaratan atau SOP yang ditambahkan untuk layanan ini.</p>
                    </div>
                  ) : (
                    <>
                      {selectedRequirements.requirementsText && (
                        <div>
                          <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-600 mb-4 flex items-center gap-2">
                            <FileText className="h-4 w-4" /> Berkas yang Disiapkan
                          </h4>
                          <div className="prose prose-sm prose-slate max-w-none">
                            <div className="whitespace-pre-line text-slate-600 font-medium leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100">
                              {selectedRequirements.requirementsText}
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedRequirements.sopUrl && (
                        <div>
                          <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-600 mb-4 flex items-center gap-2">
                            <Layers3 className="h-4 w-4" /> Standar Operasional Prosedur (SOP)
                          </h4>
                          <a 
                            href={selectedRequirements.sopUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-50 text-blue-600 font-bold hover:bg-blue-100 transition-colors"
                          >
                            Lihat Dokumen SOP <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="p-6 border-t border-slate-100 bg-white mt-auto">
                  <button
                    onClick={() => {
                      handleApply(selectedRequirements);
                    }}
                    className="w-full flex justify-center items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20 hover:bg-emerald-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                  >
                    Saya Sudah Siap, Ajukan Layanan <ArrowRightCircle className="h-5 w-5" />
                  </button>
                </div>
              </m.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
