"use client";

import { useState, useRef, useMemo } from "react";
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
  activeDetail,
  onToggleDetail,
}: {
  item: ServiceItem;
  index: number;
  basePath: string;
  activeDetail: "form" | "req" | null;
  onToggleDetail: (type: "form" | "req") => void;
}) {

  const formFields = item.serviceFormFields || (item as any).form_fields || (item as any).service_form_fields || [];
  const requirements = item.serviceRequirements || (item as any).requirements || (item as any).service_requirements || [];

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

        {/* Info Grid - List di Mobile, 3 Kolom di Desktop */}
        <div className="flex flex-col sm:grid sm:grid-cols-3 gap-2.5 sm:gap-3.5">
          {/* Card 1: Estimasi */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 sm:p-4 flex items-center justify-between sm:flex-col sm:items-start sm:justify-between transition-all hover:bg-slate-100/80">
            <div className="flex items-center gap-3 sm:gap-0 sm:flex-col sm:items-start">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/60 shadow-xs sm:mb-2">
                <Timer className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </div>
              <div className="sm:mt-0">
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  ESTIMASI
                </p>
                <p className="text-xs sm:text-sm font-black text-slate-800 leading-tight">
                  {item.estimatedTime || (item as any).estimated_time || "1–3 Hari"}
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Formulir */}
          <div className="flex flex-col">
            <button
              onClick={() => onToggleDetail("form")}
              className={`text-left rounded-2xl border p-3 sm:p-4 transition-all duration-300 flex items-center justify-between sm:flex-col sm:items-start sm:justify-between group/btn cursor-pointer ${
                activeDetail === "form"
                  ? "border-emerald-300 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-500/20"
                  : "border-slate-100 bg-slate-50/70 hover:bg-emerald-50/40 hover:border-emerald-200"
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-0 sm:flex-col sm:items-start w-full justify-between sm:justify-start">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300 sm:mb-2 ${
                      activeDetail === "form"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-emerald-50 text-emerald-600 border border-emerald-100/60 group-hover/btn:bg-emerald-600 group-hover/btn:text-white"
                    }`}
                  >
                    <FileText className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                  </div>
                  <div className="sm:hidden">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      FORMULIR
                    </p>                    <p className="text-xs font-black text-slate-800 leading-tight">
                      {formFields.length} Kolom
                    </p>
                  </div>
                </div>

                <div className="hidden sm:block w-full">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    FORMULIR
                  </p>
                  <div className="flex items-center justify-between w-full mt-0.5">
                    <p className="text-sm font-black text-slate-800 leading-tight">
                      {formFields.length} Kolom
                    </p>
                    <div className="p-1 rounded-lg bg-slate-200/50 group-hover/btn:bg-emerald-100 transition-colors">
                      <ChevronDown
                        className={`h-3 w-3 text-slate-500 group-hover/btn:text-emerald-700 transition-transform duration-300 ${
                          activeDetail === "form" ? "rotate-180 text-emerald-700" : ""
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div className="sm:hidden p-1 rounded-lg bg-slate-200/50 group-hover/btn:bg-emerald-100 transition-colors">
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-slate-500 group-hover/btn:text-emerald-700 transition-transform duration-300 ${
                      activeDetail === "form" ? "rotate-180 text-emerald-700" : ""
                    }`}
                  />
                </div>
              </div>
            </button>

            {/* Mobile Expandable Area for Form */}
            <AnimatePresence mode="wait">
              {activeDetail === "form" && (
                <m.div
                  key="form-detail-mobile"
                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                  animate={{ height: "auto", opacity: 1, marginTop: 8 }}
                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                  className="overflow-hidden sm:hidden"
                >
                  <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/60 to-slate-50/60 p-3.5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between pb-2.5 border-b border-emerald-100/80">
                      <div className="flex items-center gap-2.5">
                        <div className="rounded-lg bg-emerald-600 p-2 text-white shadow-sm">
                          <ClipboardList className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-[11px] font-black uppercase tracking-tight text-slate-800">
                            Rincian Formulir Isian
                          </h4>
                          <p className="text-[9px] font-medium text-slate-500">
                            Informasi yang wajib diisi
                          </p>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full shrink-0">
                        {formFields.length} Kolom
                      </span>
                    </div>

                    <div className="grid gap-1.5">
                      {formFields.length > 0 ? (
                        formFields
                          .sort((a: any, b: any) => (a.sortOrder || a.sort_order || 0) - (b.sortOrder || b.sort_order || 0))
                          .map((field: any, fidx: number) => (
                            <div
                              key={field.id}
                              className="flex items-start justify-between gap-2.5 rounded-xl border border-slate-200/60 bg-white p-2.5 shadow-2xs"
                            >
                              <div className="flex items-start gap-2 min-w-0 flex-1">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-[9px] font-bold text-emerald-700 border border-emerald-100 mt-0.5">
                                  {fidx + 1}
                                </span>
                                <span className="text-xs font-bold text-slate-800 leading-snug break-words">
                                  {field.label}
                                </span>
                              </div>
                              {field.isRequired || field.is_required ? (
                                <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200/60 shrink-0 mt-0.5">
                                  Wajib *
                                </span>
                              ) : (
                                <span className="text-[9px] font-semibold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/50 shrink-0 mt-0.5">
                                  Opsional
                                </span>
                              )}
                            </div>
                          ))
                      ) : (
                        <div className="py-3 text-center rounded-xl bg-white/60 border border-dashed border-slate-200">
                          <p className="text-[11px] font-medium text-slate-400">
                            Tidak ada kolom isian khusus.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </m.div>
              )}
            </AnimatePresence>
          </div>

          {/* Card 3: Syarat */}
          <div className="flex flex-col">
            <button
              onClick={() => onToggleDetail("req")}
              className={`text-left rounded-2xl border p-3 sm:p-4 transition-all duration-300 flex items-center justify-between sm:flex-col sm:items-start sm:justify-between group/btn cursor-pointer ${
                activeDetail === "req"
                  ? "border-emerald-300 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-500/20"
                  : "border-slate-100 bg-slate-50/70 hover:bg-emerald-50/40 hover:border-emerald-200"
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-0 sm:flex-col sm:items-start w-full justify-between sm:justify-start">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300 sm:mb-2 ${
                      activeDetail === "req"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-emerald-50 text-emerald-600 border border-emerald-100/60 group-hover/btn:bg-emerald-600 group-hover/btn:text-white"
                    }`}
                  >
                    <FolderCheck className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                  </div>
                  <div className="sm:hidden">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      SYARAT
                    </p>
                    <p className="text-xs font-black text-slate-800 leading-tight">
                      {requirements.length} Berkas
                    </p>
                  </div>
                </div>

                <div className="hidden sm:block w-full">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    SYARAT
                  </p>
                  <div className="flex items-center justify-between w-full mt-0.5">
                    <p className="text-sm font-black text-slate-800 leading-tight">
                      {requirements.length} Berkas
                    </p>
                    <div className="p-1 rounded-lg bg-slate-200/50 group-hover/btn:bg-emerald-100 transition-colors">
                      <ChevronDown
                        className={`h-3 w-3 text-slate-500 group-hover/btn:text-emerald-700 transition-transform duration-300 ${
                          activeDetail === "req" ? "rotate-180 text-emerald-700" : ""
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div className="sm:hidden p-1 rounded-lg bg-slate-200/50 group-hover/btn:bg-emerald-100 transition-colors">
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-slate-500 group-hover/btn:text-emerald-700 transition-transform duration-300 ${
                      activeDetail === "req" ? "rotate-180 text-emerald-700" : ""
                    }`}
                  />
                </div>
              </div>
            </button>

            {/* Mobile Expandable Area for Requirements */}
            <AnimatePresence mode="wait">
              {activeDetail === "req" && (
                <m.div
                  key="req-detail-mobile"
                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                  animate={{ height: "auto", opacity: 1, marginTop: 8 }}
                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                  className="overflow-hidden sm:hidden"
                >
                  <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/60 to-slate-50/60 p-3.5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between pb-2.5 border-b border-emerald-100/80">
                      <div className="flex items-center gap-2.5">
                        <div className="rounded-lg bg-emerald-600 p-2 text-white shadow-sm">
                          <Files className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-[11px] font-black uppercase tracking-tight text-slate-800">
                            Dokumen Persyaratan
                          </h4>
                          <p className="text-[9px] font-medium text-slate-500">
                            Berkas digital yang wajib diunggah
                          </p>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full shrink-0">
                        {requirements.length} Berkas
                      </span>
                    </div>

                    <div className="grid gap-2">
                      {requirements.length > 0 ? (
                        requirements
                          .sort((a: any, b: any) => (a.sortOrder || a.sort_order || 0) - (b.sortOrder || b.sort_order || 0))
                          .map((req: any, ridx: number) => (
                            <div
                              key={req.id}
                              className="flex items-start justify-between gap-2 rounded-xl border border-slate-200/60 bg-white p-2.5 shadow-2xs"
                            >
                              <div className="flex items-start gap-2 min-w-0 flex-1">
                                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-[9px] font-bold text-emerald-700 border border-emerald-100">
                                  {ridx + 1}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-bold leading-snug text-slate-800 break-words">
                                    {req.documentName || req.document_name}
                                  </p>
                                  {req.description && (
                                    <p className="mt-0.5 text-[10px] leading-relaxed text-slate-500">
                                      {req.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {req.isRequired || req.is_required ? (
                                <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200/60 shrink-0">
                                  Wajib *
                                </span>
                              ) : (
                                <span className="text-[9px] font-semibold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/50 shrink-0">
                                  Opsional
                                </span>
                              )}
                            </div>
                          ))
                      ) : (
                        <div className="py-3 text-center rounded-xl bg-white/60 border border-dashed border-slate-200">
                          <p className="text-[11px] font-medium text-slate-400">
                            Tidak ada dokumen persyaratan.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Desktop Expandable Content Area */}
        <AnimatePresence mode="wait">
          {activeDetail === "form" && (
            <m.div
              key="form-detail-desktop"
              initial={{ height: 0, opacity: 0, marginTop: 0 }}
              animate={{ height: "auto", opacity: 1, marginTop: 14 }}
              exit={{ height: 0, opacity: 0, marginTop: 0 }}
              className="overflow-hidden hidden sm:block"
            >
              <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/60 to-slate-50/60 p-4 sm:p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between pb-3 border-b border-emerald-100/80">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-emerald-600 p-2.5 text-white shadow-md shadow-emerald-600/20">
                      <ClipboardList className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-tight text-slate-800">
                        Rincian Formulir Isian
                      </h4>
                      <p className="text-[11px] font-medium text-slate-500">
                        Informasi yang wajib diisi pada formulir pengajuan online
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full">
                    {formFields.length} Kolom Isian
                  </span>
                </div>

                <div className="grid gap-2">
                  {formFields.length > 0 ? (
                    formFields
                      .sort((a: any, b: any) => (a.sortOrder || a.sort_order || 0) - (b.sortOrder || b.sort_order || 0))
                      .map((field: any, fidx: number) => (
                        <div
                          key={field.id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/60 bg-white p-3 shadow-2xs transition-all hover:border-emerald-300 hover:shadow-xs"
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[10px] font-bold text-emerald-700 border border-emerald-100">
                              {fidx + 1}
                            </span>
                            <span className="text-xs font-bold text-slate-800">
                              {field.label}
                            </span>
                          </div>
                          {field.isRequired || field.is_required ? (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/60 shrink-0">
                              Wajib *
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/50 shrink-0">
                              Opsional
                            </span>
                          )}
                        </div>
                      ))
                  ) : (
                    <div className="py-4 text-center rounded-xl bg-white/60 border border-dashed border-slate-200">
                      <p className="text-xs font-medium text-slate-400">
                        Tidak ada kolom isian khusus untuk layanan ini.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </m.div>
          )}

          {activeDetail === "req" && (
            <m.div
              key="req-detail-desktop"
              initial={{ height: 0, opacity: 0, marginTop: 0 }}
              animate={{ height: "auto", opacity: 1, marginTop: 14 }}
              exit={{ height: 0, opacity: 0, marginTop: 0 }}
              className="overflow-hidden hidden sm:block"
            >
              <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/60 to-slate-50/60 p-4 sm:p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between pb-3 border-b border-emerald-100/80">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-emerald-600 p-2.5 text-white shadow-md shadow-emerald-600/20">
                      <Files className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-tight text-slate-800">
                        Dokumen Persyaratan
                      </h4>
                      <p className="text-[11px] font-medium text-slate-500">
                        Berkas digital yang wajib diunggah/disiapkan
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full">
                    {requirements.length} Berkas Digital
                  </span>
                </div>

                <div className="grid gap-2.5">
                  {requirements.length > 0 ? (
                    requirements
                      .sort((a: any, b: any) => (a.sortOrder || a.sort_order || 0) - (b.sortOrder || b.sort_order || 0))
                      .map((req: any, ridx: number) => (
                        <div
                          key={req.id}
                          className="flex items-start justify-between gap-3 rounded-xl border border-slate-200/60 bg-white p-3.5 shadow-2xs transition-all hover:border-emerald-300 hover:shadow-xs"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[10px] font-bold text-emerald-700 border border-emerald-100">
                              {ridx + 1}
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-bold leading-tight text-slate-800">
                                {req.documentName || req.document_name}
                              </p>
                              {req.description && (
                                <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                                  {req.description}
                                </p>
                              )}
                            </div>
                          </div>
                          {req.isRequired || req.is_required ? (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/60 shrink-0">
                              Wajib *
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/50 shrink-0">
                              Opsional
                            </span>
                          )}
                        </div>
                      ))
                  ) : (
                    <div className="py-4 text-center rounded-xl bg-white/60 border border-dashed border-slate-200">
                      <p className="text-xs font-medium text-slate-400">
                        Tidak ada dokumen persyaratan digital yang diwajibkan.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/70 p-5 sm:flex-row sm:px-7 mt-auto">
        <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Layanan Online
        </div>
        <Link
          href={`${basePath}?serviceId=${item.id}`}
          className="group/btn relative inline-flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition-all duration-300 hover:from-emerald-700 hover:to-teal-800 hover:shadow-emerald-700/30 hover:scale-[1.02] active:scale-[0.98] sm:w-auto cursor-pointer"
        >
          <span>Mulai Ajukan Sekarang</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1.5" />
        </Link>
      </div>
    </m.div>
  );
}

export function ServiceItemsAccordion({
  items,
  basePath = "/masyarakat/pengajuan/baru",
}: {
  items: ServiceItem[];
  initialOpenId?: string;
  basePath?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Single active state across all service items
  const [openDetail, setOpenDetail] = useState<{ itemId: string; type: "form" | "req" } | null>(null);

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

  // Filter items: Hanya tampilkan item layanan yang berstatus AKTIF (isActive !== false) untuk pemohon
  const activeItems = useMemo(() => {
    return items || [];
  }, [items]);

  if (!activeItems || activeItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
        <p className="text-sm font-medium text-slate-500">
          Belum ada item layanan yang aktif tersedia untuk unit ini saat ini.
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
        {activeItems.map((item: any, idx: number) => (
          <div key={item.id} className="w-[85vw] max-w-[340px] shrink-0 snap-center md:w-auto md:max-w-none md:shrink">
            <ServiceItemCard
              item={item}
              index={idx}
              basePath={basePath}
              activeDetail={openDetail && openDetail.itemId === item.id.toString() ? openDetail.type : null}
              onToggleDetail={(type) => {
                setOpenDetail((prev: { itemId: string; type: "form" | "req" } | null) => {
                  if (prev && prev.itemId === item.id.toString() && prev.type === type) {
                    return null;
                  }
                  return { itemId: item.id.toString(), type };
                });
              }}
            />
          </div>
        ))}
      </div>
      
      {/* Pagination Dots (Mobile Only) */}
      {activeItems.length > 1 && (
        <div className="mt-4 flex md:hidden items-center justify-center gap-1.5">
          {activeItems.map((_: any, idx: number) => (
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
