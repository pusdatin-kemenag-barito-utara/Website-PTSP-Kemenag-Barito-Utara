"use client";

import { m, AnimatePresence, Reorder } from "framer-motion";
import { Pencil, Trash2, Inbox, GripVertical } from "lucide-react";

export function ItemLayananTable({
  filteredItems,
  onEdit,
  onDelete,
  onReorder,
  isSuperAdmin = false,
}: {
  filteredItems: any[];
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
  onReorder: (newItems: any[]) => void;
  isSuperAdmin?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200/60 bg-slate-50/50">
              <th className="px-5 py-3.5 text-left text-xs font-black uppercase tracking-wider text-slate-400 w-10">
                {/* Drag Handle Column */}
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-black uppercase tracking-wider text-slate-400">
                Nama Item & Slug
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-black uppercase tracking-wider text-slate-400 w-64">
                Induk Layanan
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-black uppercase tracking-wider text-slate-400 w-32">
                Status
              </th>
              <th className="px-5 py-3.5 text-right text-xs font-black uppercase tracking-wider text-slate-400 w-48">
                Aksi
              </th>
            </tr>
          </thead>
          <Reorder.Group
            axis="y"
            values={filteredItems}
            onReorder={onReorder}
            as="tbody"
            className="divide-y divide-slate-100"
          >
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item: any) => (
                <Reorder.Item
                  value={item}
                  key={item.id}
                  as="tr"
                  className="group transition-colors duration-150 hover:bg-slate-50/50"
                >
                  <td className="px-5 py-4">
                    <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-[#059669] transition-colors">
                      <GripVertical className="h-5 w-5" />
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-slate-900">
                        {item.name}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                        <div className="w-3 border-t border-slate-300" />
                        {item.slug}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200/60">
                      {item.service?.name || "Tidak Diketahui"}
                    </span>
                  </td>
                  <td className="px-5 py-4 align-middle">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                        item.isActive
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60"
                          : "bg-rose-50 text-rose-700 ring-1 ring-rose-200/60"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${item.isActive ? "bg-emerald-500" : "bg-rose-500"}`}
                      />
                      {item.isActive ? "AKTIF" : "NONAKTIF"}
                    </span>
                  </td>
                  <td className="px-5 py-4 align-middle">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEdit(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold text-slate-700 bg-white border border-slate-200/80 hover:bg-emerald-50 hover:text-[#059669] hover:border-emerald-200 transition-all duration-200 shadow-sm"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold text-rose-600 bg-white border border-rose-200/60 hover:bg-rose-50 hover:border-rose-300 transition-all duration-200 shadow-sm"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Hapus
                      </button>
                    </div>
                  </td>
                </Reorder.Item>
              ))}
            </AnimatePresence>
            {!filteredItems?.length && (
              <tr>
                <td colSpan={5} className="px-5 py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
                      <Inbox className="h-8 w-8 text-slate-300" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-500">
                        Belum ada item layanan
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-400">
                        Klik tombol &quot;Tambah Item Baru&quot; untuk memulai.
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </Reorder.Group>
        </table>
      </div>
    </div>
  );
}
