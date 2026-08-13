import { motion as m, AnimatePresence, Reorder } from "framer-motion";
import { Pencil, Trash2, Inbox, GripVertical } from "lucide-react";

export function FormFieldTable({
  filteredFields,
  onEdit,
  onDelete,
  onReorder,
  isReorderable,
  isPending,
}: {
  filteredFields: any[];
  onEdit: (field: any) => void;
  onDelete: (field: any) => void;
  onReorder: (newFields: any[]) => void;
  isReorderable: boolean;
  isPending: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200/60 bg-slate-50/50">
              <th className="px-5 py-3.5 text-left text-xs font-black uppercase tracking-wider text-slate-400 w-10">
                {/* Grip Handle Column */}
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-black uppercase tracking-wider text-slate-400 w-16">
                No
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-black uppercase tracking-wider text-slate-400">
                Label & Nama Field
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-black uppercase tracking-wider text-slate-400 w-48">
                Item Layanan
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-black uppercase tracking-wider text-slate-400 w-32">
                Tipe
              </th>
              <th className="px-5 py-3.5 text-center text-xs font-black uppercase tracking-wider text-slate-400 w-24">
                Wajib
              </th>
              <th className="px-5 py-3.5 text-right text-xs font-black uppercase tracking-wider text-slate-400 w-40">
                Aksi
              </th>
            </tr>
          </thead>
          <Reorder.Group
            axis="y"
            values={filteredFields}
            onReorder={onReorder}
            as="tbody"
            className="divide-y divide-slate-100"
          >
            <AnimatePresence mode="popLayout">
              {filteredFields.map((field, idx) => (
                <Reorder.Item
                  value={field}
                  key={field.id}
                  as="tr"
                  className="group transition-colors duration-150 hover:bg-slate-50/50"
                >
                  <td className="px-5 py-4">
                    {isReorderable && (
                      <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-[#059669] transition-colors">
                        <GripVertical className="h-5 w-5" />
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-black text-slate-400 tabular-nums">
                      #{idx + 1}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-slate-900">
                        {field.label}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                        <div className="w-2 border-t border-slate-300" />
                        {field.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                      {field.serviceItem?.name || "N/A"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                      {field.type}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    {field.isRequired ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 uppercase tracking-tighter">
                        Wajib
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 uppercase tracking-tighter">
                        Opsional
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEdit(field)}
                        disabled={isPending}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-[#059669] transition-all"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(field)}
                        disabled={isPending}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </Reorder.Item>
              ))}
            </AnimatePresence>

            {!filteredFields.length && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50">
                      <Inbox className="h-6 w-6 text-slate-300" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-500">
                        Belum ada field
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-400">
                        Klik tombol &quot;Tambah Field&quot; untuk memulai.
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
