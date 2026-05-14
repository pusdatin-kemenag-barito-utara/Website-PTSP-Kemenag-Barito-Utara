"use client";

import { useState } from "react";
import {
  ChevronDown,
  FileText,
  FolderCheck,
  Timer,
  ArrowRight,
  ClipboardList,
  Files,
  Info,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface ServiceItem {
  id: string;
  name: string;
  description: string | null;
  // @ts-ignore
  estimated_time?: string | null;
  service_requirements: any[];
  service_form_fields: any[];
}

export function ServiceItemsAccordion({ items }: { items: ServiceItem[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id || null);
  const [activeDetail, setActiveDetail] = useState<"form" | "req" | null>(null);

  const toggleItem = (id: string) => {
    if (openId !== id) {
      setOpenId(id);
      setActiveDetail(null);
    } else {
      setOpenId(null);
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
    <div className="space-y-4">
      {items.map((item, idx) => {
        const isOpen = openId === item.id;
        return (
          <div
            key={item.id}
            className={`overflow-hidden rounded-[2rem] border transition-all duration-500 ${
              isOpen
                ? "border-emerald-200 bg-white shadow-[0_20px_50px_rgba(5,150,105,0.1)]"
                : "border-slate-100 bg-white hover:border-emerald-100 hover:shadow-xl"
            }`}
          >
            {/* Header / Trigger */}
            <button
              onClick={() => toggleItem(item.id)}
              className="flex w-full items-center justify-between gap-3 p-5 text-left sm:gap-4 sm:p-6 sm:px-8"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <span
                  className={`hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black transition-all duration-500 ${
                    isOpen
                      ? "bg-[#059669] text-white rotate-[360deg]"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <h3
                    className={`text-base font-black leading-tight transition-colors duration-300 sm:text-lg flex gap-1.5 items-start ${
                      isOpen ? "text-[#059669]" : "text-slate-900"
                    }`}
                  >
                    <span className="sm:hidden shrink-0">{idx + 1}. </span>
                    <span>{item.name}</span>
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <FolderCheck className="h-2.5 w-2.5" />
                      {item.service_requirements?.length ?? 0} Dokumen
                    </span>
                    <span className="hidden h-1 w-1 rounded-full bg-slate-200 sm:block" />
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <FileText className="h-2.5 w-2.5" />
                      {item.service_form_fields?.length ?? 0} Formulir
                    </span>
                  </div>
                </div>
              </div>
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-500 sm:h-8 sm:w-8 ${
                  isOpen
                    ? "border-emerald-200 bg-emerald-50 text-[#059669] rotate-180"
                    : "border-slate-100 bg-slate-50 text-slate-400"
                }`}
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </div>
            </button>

            {/* Content with Animation */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                >
                    <div className="border-t border-slate-50 p-4 pt-5 sm:p-8 sm:pt-6">
                      {/* Grid Wrapper for Inline Expansion */}
                    <div className="grid gap-3 grid-cols-1 sm:grid-cols-3 sm:gap-4">
                      
                      {/* Card 1: Estimasi */}
                      <div className="rounded-2xl border border-slate-100 bg-white p-3.5 sm:p-4 shadow-sm h-full">
                        <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 sm:h-10 sm:w-10 sm:rounded-xl">
                          <Timer className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 sm:text-[10px]">
                          Estimasi Waktu
                        </p>
                        <p className="mt-0.5 text-xs font-black text-slate-800 sm:text-sm">
                          {item.estimated_time || "1-3 Hari Kerja"}
                        </p>
                      </div>

                      {/* Card 2: Input Formulir */}
                      <button 
                        onClick={() => setActiveDetail(activeDetail === "form" ? null : "form")}
                        className={`group text-left rounded-2xl border p-3.5 sm:p-4 transition-all ${activeDetail === "form" ? "border-emerald-200 bg-emerald-50/40 shadow-inner" : "border-slate-100 bg-white hover:border-emerald-100"}`}
                      >
                        <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg transition-colors sm:h-10 sm:w-10 sm:rounded-xl ${activeDetail === "form" ? "bg-emerald-500 text-white" : "bg-emerald-50 text-emerald-600"}`}>
                          <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 sm:text-[10px]">
                              Input Formulir
                            </p>
                            <p className="mt-0.5 text-xs font-black text-slate-800 sm:text-sm truncate">
                              {item.service_form_fields?.length ?? 0} Kolom Isian
                            </p>
                          </div>
                          <ChevronDown className={`h-3.5 w-3.5 text-emerald-400 shrink-0 transition-transform duration-300 ${activeDetail === "form" ? "rotate-180" : ""}`} />
                        </div>
                      </button>

                      {/* Detail 1: Inline Form Details (Only visible when form active) */}
                      <AnimatePresence mode="wait">
                        {activeDetail === "form" && (
                          <motion.div
                            key="form-detail-inline"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden sm:col-span-3 sm:order-last sm:mt-2"
                          >
                            <div className="rounded-2xl border border-emerald-100 p-5 bg-emerald-50/20 sm:p-6 mb-2 sm:mb-0">
                              <div className="flex items-center gap-3 mb-4 sm:mb-5">
                                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 sm:p-2 sm:rounded-xl">
                                  <ClipboardList className="h-4 w-4 sm:h-5 sm:w-5" />
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight sm:text-sm">Rincian Formulir Isian</h4>
                                  <p className="text-[10px] text-slate-500 font-medium sm:text-[11px]">Informasi yang harus diisi pada formulir online</p>
                                </div>
                              </div>
                              <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
                                {item.service_form_fields?.length > 0 ? (
                                  item.service_form_fields.sort((a,b) => a.sort_order - b.sort_order).map((field, fidx) => (
                                    <div key={field.id} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-emerald-50/50 shadow-sm">
                                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[9px] font-bold text-emerald-500 mt-0.5 sm:h-6 sm:w-6 sm:text-[10px]">
                                        {fidx + 1}
                                      </span>
                                      <span className="text-[12px] font-bold text-slate-700 sm:text-[13px]">{field.label} {field.is_required && <span className="text-rose-500">*</span>}</span>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-xs text-slate-400 italic col-span-2">Tidak ada kolom isian khusus</p>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Card 3: Dokumen Syarat */}
                      <button 
                        onClick={() => setActiveDetail(activeDetail === "req" ? null : "req")}
                        className={`group text-left rounded-2xl border p-3.5 sm:p-4 transition-all ${activeDetail === "req" ? "border-emerald-200 bg-emerald-50/40 shadow-inner" : "border-slate-100 bg-white hover:border-emerald-100"}`}
                      >
                        <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg transition-colors sm:h-10 sm:w-10 sm:rounded-xl ${activeDetail === "req" ? "bg-emerald-500 text-white" : "bg-emerald-50 text-emerald-600"}`}>
                          <FolderCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 sm:text-[10px]">
                              Dokumen Syarat
                            </p>
                            <p className="mt-0.5 text-xs font-black text-slate-800 sm:text-sm truncate">
                              {item.service_requirements?.length ?? 0} Berkas Digital
                            </p>
                          </div>
                          <ChevronDown className={`h-3.5 w-3.5 text-emerald-400 shrink-0 transition-transform duration-300 ${activeDetail === "req" ? "rotate-180" : ""}`} />
                        </div>
                      </button>

                      {/* Detail 2: Inline Requirement Details */}
                      <AnimatePresence mode="wait">
                        {activeDetail === "req" && (
                          <motion.div
                            key="req-detail-inline"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden sm:col-span-3 sm:order-last sm:mt-2"
                          >
                            <div className="rounded-2xl border border-emerald-100 p-5 bg-emerald-50/20 sm:p-6 mb-2 sm:mb-0">
                              <div className="flex items-center gap-3 mb-4 sm:mb-5">
                                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 sm:p-2 sm:rounded-xl">
                                  <Files className="h-4 w-4 sm:h-5 sm:w-5" />
                                </div>
                                <div className="min-w-0">
                                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight sm:text-sm">Dokumen Persyaratan</h4>
                                  <p className="text-[10px] text-slate-500 font-medium sm:text-[11px]">Berkas digital yang harus disiapkan</p>
                                </div>
                              </div>
                              <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                                {item.service_requirements?.length > 0 ? (
                                  item.service_requirements.sort((a,b) => a.sort_order - b.sort_order).map((req, ridx) => (
                                    <div key={req.id} className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-emerald-50/50 shadow-sm sm:p-4">
                                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[9px] font-bold text-emerald-500 mt-0.5 sm:h-6 sm:w-6 sm:text-[10px]">
                                        {ridx + 1}
                                      </span>
                                      <div className="min-w-0">
                                        <p className="text-[12px] font-black text-slate-700 sm:text-[13px] leading-tight">{req.document_name} {req.is_required && <span className="text-rose-500">*</span>}</p>
                                        {req.description && <p className="text-[10px] text-slate-500 mt-1 leading-relaxed sm:text-[11px]">{req.description}</p>}
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-xs text-slate-400 italic col-span-2">Tidak ada dokumen persyaratan</p>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </div>

                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-5 sm:mt-8 sm:pt-6">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#059669]" />
                        Layanan tersedia secara online
                      </div>
                      <Link
                        href={`/dashboard/pengajuan/baru?serviceId=${item.id}`}
                        className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#059669] px-6 py-3.5 text-[13px] font-bold text-white shadow-lg shadow-emerald-900/20 transition-all hover:bg-[#047857] active:scale-95 sm:py-3 sm:text-sm"
                      >
                        Mulai Ajukan Sekarang <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
