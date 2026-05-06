import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash2, Inbox } from "lucide-react";

export function RequirementTable({
  filteredRequirements,
  items,
  onEdit,
  onDelete,
  isPending,
}: {
  filteredRequirements: any[];
  items: any[];
  onEdit: (req: any) => void;
  onDelete: (req: any) => void;
  isPending: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200/60 bg-slate-50/50">
              <th className="px-5 py-3.5 text-left text-xs font-black uppercase tracking-wider text-slate-400">
                Nama Dokumen
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-black uppercase tracking-wider text-slate-400 w-48">
                Item Layanan
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-black uppercase tracking-wider text-slate-400 w-32">
                Format File
              </th>
              <th className="px-5 py-3.5 text-center text-xs font-black uppercase tracking-wider text-slate-400 w-24">
                Wajib
              </th>
              <th className="px-5 py-3.5 text-right text-xs font-black uppercase tracking-wider text-slate-400 w-40">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <AnimatePresence>
              {filteredRequirements.map((req) => (
                <motion.tr
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={req.id}
                  className="group transition-colors duration-150 hover:bg-slate-50/50"
                >
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-slate-900">
                        {req.document_name}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 line-clamp-1">
                        <div className="w-2 border-t border-slate-300" />
                        {req.description || "Tidak ada deskripsi"}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                      {req.service_items?.name || "N/A"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(req.allowed_extensions || "pdf")
                        .split(",")
                        .map((ext: string) => (
                          <span
                            key={ext}
                            className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100"
                          >
                            {ext.trim()}
                          </span>
                        ))}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">
                      Max {req.max_file_size_mb || 5}MB
                    </p>
                  </td>
                  <td className="px-5 py-4 text-center">
                    {req.is_required ? (
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
                        onClick={() => onEdit(req)}
                        disabled={isPending}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-blue-50 hover:text-[#1f4bb7] transition-all"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(req)}
                        disabled={isPending}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>

            {!filteredRequirements.length && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50">
                      <Inbox className="h-6 w-6 text-slate-300" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-500">
                        Belum ada persyaratan
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-400">
                        Klik tombol &quot;Tambah Persyaratan&quot; untuk
                        memulai.
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
