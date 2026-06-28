"use client";

import { useState, useRef } from "react";
import {
  FileText,
  FolderCheck,
  Timer,
  ArrowRight,
  ClipboardList,
  Files,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { m, AnimatePresence } from "framer-motion";

interface ServiceItem {
  id: string;
  name: string;
  description: string | null;
  estimatedTime?: string | null;
  serviceRequirements: any[];
  serviceFormFields: any[];
}

export function ServiceItemCard({
  item,
  index,
  basePath,
}: {
  item: ServiceItem;
  index: number;
  basePath: string;
}) {
  const [activeDetail, setActiveDetail] = useState<"form" | "req" | null>(null);

  return (
    <m.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-slate-200/60 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:-translate-y-2 hover:border-emerald-300/50 hover:shadow-[0_20px_40px_rgb(5,150,105,0.1)]"
    >
      {/* Decorative Gradient Background on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative z-10 flex flex-1 flex-col p-5 sm:p-7">
        <div className="mb-6 flex items-start gap-4 sm:gap-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 p-1.5 shadow-sm transition-all duration-500 group-hover:bg-emerald-50 group-hover:border-emerald-200 group-hover:shadow-emerald-500/30 group-hover:rotate-3">
            <img 
              src="/atak-portal.png" 
              alt="Icon Layanan" 
              className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-sm" 
            />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-black leading-tight tracking-tight text-slate-800 sm:text-xl transition-colors duration-300 group-hover:text-emerald-700">
              {item.name}
            </h3>
            {item.description && (
              <p className="mt-2 text-xs font-medium leading-relaxed text-slate-500 line-clamp-2">
                {item.description}
              </p>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {/* Card 1: Estimasi */}
          <div className="rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50/50 p-2.5 sm:p-4 flex flex-col justify-between">
            <div className="mb-1.5 sm:mb-2 flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-emerald-100/50 text-emerald-600">
              <Timer className="h-3 w-3 sm:h-4 sm:w-4" />
            </div>
            <div>
              <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Estimasi
              </p>
              <p className="mt-0.5 text-[10px] sm:text-xs font-black text-slate-700 sm:text-sm leading-tight">
                {item.estimatedTime || "1-3 Hari"}
              </p>
            </div>
          </div>

          {/* Card 2: Formulir */}
          <button
            onClick={() =>
              setActiveDetail(activeDetail === "form" ? null : "form")
            }
            className={`text-left rounded-xl sm:rounded-2xl border p-2.5 sm:p-4 transition-all flex flex-col justify-between ${activeDetail === "form" ? "border-emerald-200 bg-emerald-50/50 shadow-inner" : "border-slate-100 bg-white hover:bg-slate-50 hover:border-emerald-100"}`}
          >
            <div
              className={`mb-1.5 sm:mb-2 flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg sm:rounded-xl transition-colors ${activeDetail === "form" ? "bg-emerald-500 text-white" : "bg-emerald-100/50 text-emerald-600"}`}
            >
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
            </div>
            <div className="w-full flex items-end justify-between">
              <div>
                <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Formulir
                </p>
                <p className="mt-0.5 text-[10px] sm:text-xs font-black text-slate-700 sm:text-sm leading-tight">
                  {item.serviceFormFields?.length ?? 0} Kolom
                </p>
              </div>
              <ChevronDown
                className={`h-2.5 w-2.5 sm:h-3 sm:w-3 text-emerald-400 transition-transform mb-0.5 ${activeDetail === "form" ? "rotate-180" : ""}`}
              />
            </div>
          </button>

          {/* Card 3: Syarat */}
          <button
            onClick={() =>
              setActiveDetail(activeDetail === "req" ? null : "req")
            }
            className={`text-left rounded-xl sm:rounded-2xl border p-2.5 sm:p-4 transition-all flex flex-col justify-between ${activeDetail === "req" ? "border-emerald-200 bg-emerald-50/50 shadow-inner" : "border-slate-100 bg-white hover:bg-slate-50 hover:border-emerald-100"}`}
          >
            <div
              className={`mb-1.5 sm:mb-2 flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg sm:rounded-xl transition-colors ${activeDetail === "req" ? "bg-emerald-500 text-white" : "bg-emerald-100/50 text-emerald-600"}`}
            >
              <FolderCheck className="h-3 w-3 sm:h-4 sm:w-4" />
            </div>
            <div className="w-full flex items-end justify-between">
              <div>
                <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Syarat
                </p>
                <p className="mt-0.5 text-[10px] sm:text-xs font-black text-slate-700 sm:text-sm leading-tight">
                  {item.serviceRequirements?.length ?? 0} Berkas
                </p>
              </div>
              <ChevronDown
                className={`h-2.5 w-2.5 sm:h-3 sm:w-3 text-emerald-400 transition-transform mb-0.5 ${activeDetail === "req" ? "rotate-180" : ""}`}
              />
            </div>
          </button>
        </div>

        {/* Expandable Content Area */}
        <AnimatePresence mode="wait">
          {activeDetail === "form" && (
            <m.div
              key="form-detail"
              initial={{ height: 0, opacity: 0, marginTop: 0 }}
              animate={{ height: "auto", opacity: 1, marginTop: 12 }}
              exit={{ height: 0, opacity: 0, marginTop: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/20 p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600">
                    <ClipboardList className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-tight text-slate-800">
                      Rincian Formulir Isian
                    </h4>
                    <p className="text-[10px] font-medium text-slate-500">
                      Informasi yang harus diisi secara online
                    </p>
                  </div>
                </div>
                <div className="grid gap-2">
                  {item.serviceFormFields?.length > 0 ? (
                    item.serviceFormFields
                      .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                      .map((field: any, fidx: number) => (
                        <div
                          key={field.id}
                          className="flex items-center gap-3 rounded-xl border border-emerald-50/50 bg-white p-3 shadow-sm"
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[9px] font-bold text-emerald-500">
                            {fidx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-700">
                            {field.label}{" "}
                            {field.isRequired && (
                              <span className="text-rose-500">*</span>
                            )}
                          </span>
                        </div>
                      ))
                  ) : (
                    <p className="text-xs italic text-slate-400">
                      Tidak ada kolom isian khusus
                    </p>
                  )}
                </div>
              </div>
            </m.div>
          )}

          {activeDetail === "req" && (
            <m.div
              key="req-detail"
              initial={{ height: 0, opacity: 0, marginTop: 0 }}
              animate={{ height: "auto", opacity: 1, marginTop: 12 }}
              exit={{ height: 0, opacity: 0, marginTop: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/20 p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600">
                    <Files className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-tight text-slate-800">
                      Dokumen Persyaratan
                    </h4>
                    <p className="text-[10px] font-medium text-slate-500">
                      Berkas digital yang wajib disiapkan
                    </p>
                  </div>
                </div>
                <div className="grid gap-3">
                  {item.serviceRequirements?.length > 0 ? (
                    item.serviceRequirements
                      .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
                      .map((req: any, ridx: number) => (
                        <div
                          key={req.id}
                          className="flex items-start gap-3 rounded-xl border border-emerald-50/50 bg-white p-3.5 shadow-sm"
                        >
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[9px] font-bold text-emerald-500">
                            {ridx + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-black leading-tight text-slate-700">
                              {req.documentName}{" "}
                              {req.isRequired && (
                                <span className="text-rose-500">*</span>
                              )}
                            </p>
                            {req.description && (
                              <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                                {req.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                  ) : (
                    <p className="text-xs italic text-slate-400">
                      Tidak ada dokumen persyaratan
                    </p>
                  )}
                </div>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/50 p-5 sm:flex-row sm:px-7 mt-auto">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-[#059669]" />
          Layanan Online
        </div>
        <Link
          href={`${basePath}?serviceId=${item.id}`}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#059669] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 transition-all hover:bg-[#047857] active:scale-95 sm:w-auto"
        >
          Mulai Ajukan Sekarang <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </m.div>
  );
}

export function ServiceItemsAccordion({
  items,
  basePath = "/dashboard/pengajuan/baru",
}: {
  items: ServiceItem[];
  initialOpenId?: string;
  basePath?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    
    // Find the item closest to the center
    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    let closestIndex = 0;
    let minDistance = Infinity;

    Array.from(container.children).forEach((child, index) => {
      const childElement = child as HTMLElement;
      // Skip non-item children if any (there shouldn't be here)
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

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
        <p className="text-sm font-medium text-slate-500">
          Belum ada item layanan yang tersedia untuk unit ini.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 md:grid md:grid-cols-1 lg:grid-cols-2 md:gap-6 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {items.map((item: any, idx: number) => (
          <div key={item.id} className="w-[85vw] max-w-[340px] shrink-0 snap-center md:w-auto md:max-w-none md:shrink">
            <ServiceItemCard
              item={item}
              index={idx}
              basePath={basePath}
            />
          </div>
        ))}
      </div>
      
      {/* Pagination Dots (Mobile Only) */}
      {items.length > 1 && (
        <div className="mt-4 flex md:hidden items-center justify-center gap-1.5">
          {items.map((_, idx) => (
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
  );
}
