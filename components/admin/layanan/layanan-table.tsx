"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash2, Inbox } from "lucide-react";

export function LayananTable({
  services,
  isPending,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
}: {
  services: any[];
  isPending: boolean;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onEdit: (service: any) => void;
  onDelete: (service: any) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200/60 bg-slate-50/50">
              <th className="px-4 py-3.5 text-center text-xs font-black uppercase tracking-wider text-slate-400 w-16">
                Urutan
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-black uppercase tracking-wider text-slate-400">
                Nama Layanan & Slug
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-black uppercase tracking-wider text-slate-400 w-32">
                Status
              </th>
              <th className="px-5 py-3.5 text-right text-xs font-black uppercase tracking-wider text-slate-400 w-48">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <AnimatePresence>
              {services.map((service, index) => (
                <motion.tr
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={service.id}
                  className="group transition-colors duration-150 hover:bg-slate-50/50"
                >
                  <td className="px-4 py-3 align-middle text-center">
                    <div className="flex flex-col items-center justify-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onMoveUp(index)}
                        disabled={index === 0 || isPending}
                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <svg
                          className="w-3 h-3 text-slate-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => onMoveDown(index)}
                        disabled={index === services.length - 1 || isPending}
                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <svg
                          className="w-3 h-3 text-slate-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-slate-900">
                        {service.name}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                        <div className="w-3 border-t border-slate-300" />
                        {service.slug}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 align-middle">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                        service.is_active
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60"
                          : "bg-rose-50 text-rose-700 ring-1 ring-rose-200/60"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${service.is_active ? "bg-emerald-500" : "bg-rose-500"}`}
                      />
                      {service.is_active ? "AKTIF" : "NONAKTIF"}
                    </span>
                  </td>
                  <td className="px-5 py-4 align-middle">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEdit(service)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold text-slate-700 bg-white border border-slate-200/80 hover:bg-blue-50 hover:text-[#1f4bb7] hover:border-blue-200 transition-all duration-200 shadow-sm"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(service)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold text-rose-600 bg-white border border-rose-200/60 hover:bg-rose-50 hover:border-rose-300 transition-all duration-200 shadow-sm"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Hapus
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
            {!services?.length && (
              <tr>
                <td colSpan={5} className="px-5 py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
                      <Inbox className="h-8 w-8 text-slate-300" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-500">
                        Belum ada layanan
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-400">
                        Klik tombol &quot;Tambah Layanan&quot; untuk memulai.
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
