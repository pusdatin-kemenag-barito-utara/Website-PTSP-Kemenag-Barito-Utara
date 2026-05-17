"use client";

import Link from "next/link";
import { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Building2,
  Layers3,
  Search,
  ShieldCheck,
  ChevronDown,
  LayoutGrid,
} from "lucide-react";
import { m, AnimatePresence } from "framer-motion";

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

/**
 * Premium Text Highlighter
 */
function TextHighlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <span>{text}</span>;

  // Split query by comma and space to get all individual keywords
  const keywords = query
    .toLowerCase()
    .split(/[,\s]+/)
    .filter(Boolean)
    .sort((a: string, b: string) => b.length - a.length);

  if (keywords.length === 0) return <span>{text}</span>;

  const pattern = keywords
    .map((k: string) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  const regex = new RegExp(`(${pattern})`, "gi");
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part: string, i: number) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-emerald-100 text-emerald-900 px-0.5 rounded-sm font-bold"
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </span>
  );
}

function ServicesFilterContent({ services }: { services: Service[] }) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [openId, setOpenId] = useState<number | null>(null);

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

        return andKeywords.every((word: string) => {
          if (service.name.toLowerCase().includes(word)) return true;
          if (service.description?.toLowerCase().includes(word)) return true;

          return (service.serviceItems ?? []).some((item: ServiceItem) => {
            if (item.name.toLowerCase().includes(word)) return true;
            return (item.serviceRequirements ?? []).some((req: Requirement) =>
              req.documentName.toLowerCase().includes(word),
            );
          });
        });
      });
    });
  }, [query, services]);

  useEffect(() => {
    if (filteredServices.length === 1 && query.length > 2) {
      setOpenId(filteredServices[0].id);
    }
  }, [filteredServices, query]);

  const toggleItem = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="space-y-8">
      <section className="bg-white rounded-3xl sm:rounded-[2rem] p-4 sm:p-6 shadow-sm border border-slate-100">
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-[1fr,170px]">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[#059669] transition-colors" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpenId(null);
              }}
              placeholder="Cari unit atau layanan..."
              className="h-12 sm:h-14 w-full rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50/50 pl-11 pr-4 text-[13px] sm:text-sm font-medium text-slate-700 transition-all focus:bg-white focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/10 outline-none"
            />
          </div>
 
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setOpenId(null);
            }}
            className="h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-[#059669] px-6 text-sm font-bold text-white shadow-lg shadow-emerald-900/10 transition-all hover:bg-[#047857] hover:shadow-emerald-900/20 active:scale-95"
          >
            Bersihkan
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between px-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {query ? (
              <span>
                Hasil:{" "}
                <span className="text-emerald-600">
                  {filteredServices.length} Unit Kerja
                </span>{" "}
                Terdeteksi
              </span>
            ) : (
              `Menampilkan ${services.length} Unit Kerja Utama`
            )}
          </p>
        </div>
      </section>

      <section className="space-y-4">
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
          filteredServices.map((service: Service, idx: number) => {
            const isOpen = openId === service.id;
            return (
              <div
                key={service.id}
                className={`group overflow-hidden rounded-3xl sm:rounded-[2.5rem] border transition-all duration-500 ${
                  isOpen
                    ? "border-emerald-200 bg-white shadow-[0_30px_60px_rgba(5,150,105,0.1)]"
                    : "border-slate-100 bg-white hover:border-emerald-100 hover:shadow-xl"
                }`}
              >
                <button
                  onClick={() => toggleItem(service.id)}
                  className="flex w-full items-center justify-between gap-3 sm:gap-4 p-4 sm:p-8 text-left"
                >
                  <div className="flex items-center gap-3 sm:gap-6 min-w-0">
                    <span
                      className={`hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xs font-black transition-all duration-500 ${
                        isOpen
                          ? "bg-[#059669] text-white rotate-[360deg] shadow-lg shadow-emerald-200"
                          : "bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600"
                      }`}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[8px] sm:text-[10px] font-black uppercase tracking-wider text-emerald-600">
                          <Building2 className="h-2 w-2 sm:h-3 sm:w-3" />
                          Unit
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 text-[8px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400">
                          <Layers3 className="h-2 w-2 sm:h-3 sm:w-3" />
                          {service.serviceItems?.length ?? 0} Item
                        </span>
                      </div>
                      <h3
                        className={`text-base sm:text-2xl font-black transition-colors duration-300 leading-tight ${
                          isOpen
                            ? "text-[#059669]"
                            : "text-slate-900 group-hover:text-[#059669]"
                        }`}
                      >
                        <TextHighlight text={service.name} query={query} />
                      </h3>
                    </div>
                  </div>

                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-500 ${
                      isOpen
                        ? "border-emerald-200 bg-emerald-50 text-[#059669] rotate-180 shadow-inner"
                        : "border-slate-100 bg-slate-50 text-slate-400 group-hover:border-emerald-200 group-hover:bg-emerald-50 group-hover:text-emerald-600"
                    }`}
                  >
                    <ChevronDown className="h-5 w-5" />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <m.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        duration: 0.4,
                        ease: [0.04, 0.62, 0.23, 0.98],
                      }}
                    >
                      <div className="px-6 pb-8 sm:px-10 border-t border-slate-50 pt-8 bg-slate-50/30">
                        <div className="grid gap-8 lg:grid-cols-12">
                          <div className="lg:col-span-12 space-y-4">
                            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">
                              Pilih Layanan Spesifik:
                            </h4>
                            <div className="grid gap-3 sm:grid-cols-2">
                              {service.serviceItems &&
                              service.serviceItems.length > 0 ? (
                                service.serviceItems.map(
                                  (item: ServiceItem, ridx: number) => {
                                    const isMatching =
                                      query &&
                                      (item.name
                                        .toLowerCase()
                                        .includes(query.toLowerCase()) ||
                                        (item.serviceRequirements ?? []).some(
                                          (r: Requirement) =>
                                            r.documentName
                                              .toLowerCase()
                                              .includes(query.toLowerCase()),
                                        ));

                                    return (
                                      <Link
                                        key={item.id}
                                        href={`/layanan/${service.slug}?item=${item.id}`}
                                        className={`flex items-center justify-between gap-3 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border transition-all group/item ${
                                          isMatching
                                            ? "border-emerald-200 bg-emerald-50/50 ring-2 ring-emerald-500/10"
                                            : "border-white bg-white hover:border-emerald-200 hover:shadow-lg"
                                        }`}
                                      >
                                        <div className="flex gap-2 sm:gap-3 items-start min-w-0">
                                          <span
                                            className={`text-[13px] sm:text-sm font-black shrink-0 mt-0.5 ${isMatching ? "text-emerald-600" : "text-slate-300"}`}
                                          >
                                            {ridx + 1}.
                                          </span>
                                          <div className="min-w-0">
                                            <span className="text-[13px] sm:text-[15px] font-bold text-slate-700 leading-tight block">
                                              <TextHighlight
                                                text={item.name}
                                                query={query}
                                              />
                                            </span>
                                            {isMatching &&
                                              (
                                                item.serviceRequirements ?? []
                                              ).some((r) =>
                                                r.documentName
                                                  .toLowerCase()
                                                  .includes(
                                                    query.toLowerCase(),
                                                  ),
                                              ) && (
                                                <p className="mt-2 text-[10px] text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                                  <ShieldCheck className="h-3 w-3" />{" "}
                                                  Syarat Terdeteksi:{" "}
                                                  <span className="text-emerald-900/50">
                                                    {
                                                      item.serviceRequirements?.find(
                                                        (r) =>
                                                          r.documentName
                                                            .toLowerCase()
                                                            .includes(
                                                              query.toLowerCase(),
                                                            ),
                                                      )?.documentName
                                                    }
                                                  </span>
                                                </p>
                                              )}
                                          </div>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-slate-300 group-hover/item:text-emerald-500 group-hover/item:translate-x-1 transition-all shrink-0" />
                                      </Link>
                                    );
                                  },
                                )
                              ) : (
                                <div className="col-span-2 py-8 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    Belum ada item layanan
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}

export function ServicesFilter({ services }: { services: Service[] }) {
  return (
    <Suspense
      fallback={
        <div className="h-20 flex items-center justify-center">
          <div className="animate-spin h-6 w-6 border-2 border-emerald-600 border-t-transparent rounded-full" />
        </div>
      }
    >
      <ServicesFilterContent services={services} />
    </Suspense>
  );
}
