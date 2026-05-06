import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";

export function AddEditServiceModal({
  isOpen,
  editingService,
  formData,
  isPending,
  onClose,
  onChangeName,
  onChangeFormData,
  onSubmit,
}: {
  isOpen: boolean;
  editingService: any | null;
  formData: any;
  isPending: boolean;
  onClose: () => void;
  onChangeName: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeFormData: (updates: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <AnimatePresence>
      {(isOpen || editingService) && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl z-50 border border-slate-200/60"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10">
              <h3 className="text-lg font-black text-slate-800">
                {editingService ? "Edit Layanan" : "Tambah Layanan Baru"}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-slate-200/50 text-slate-400 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={onSubmit} className="p-6 space-y-5">
              <Field label="Nama Layanan" required>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={onChangeName}
                  required
                  placeholder="Contoh: Pelayanan Pendidik dan Tenaga Kependidikan"
                  className="font-medium"
                />
              </Field>

              <Field
                label="Slug URL (Otomatis)"
                hint="Slug di-generate otomatis dari nama layanan."
              >
                <div className="flex items-center">
                  <span className="bg-slate-100 border border-slate-200 border-r-0 rounded-l-lg px-3 py-2 text-sm text-slate-500 font-mono">
                    /
                  </span>
                  <Input
                    name="slug"
                    value={formData.slug}
                    onChange={(e) => onChangeFormData({ slug: e.target.value })}
                    required
                    className="rounded-l-none font-mono text-sm text-[#1f4bb7]"
                  />
                </div>
              </Field>

              <Field label="Deskripsi Singkat">
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={(e) =>
                    onChangeFormData({ description: e.target.value })
                  }
                  placeholder="Tulis deskripsi singkat tentang layanan ini..."
                  className="min-h-[100px] resize-none"
                />
              </Field>
              <div className="pt-2">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/60 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) =>
                        onChangeFormData({ is_active: e.target.checked })
                      }
                      className="peer sr-only"
                    />
                    <div className="w-10 h-6 bg-slate-300 rounded-full peer-checked:bg-emerald-500 transition-colors relative after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">
                      Status Aktif
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Layanan akan muncul dan bisa diakses di halaman beranda.
                    </p>
                  </div>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white border-t border-slate-100 pt-4 mt-6 -mx-6 px-6 pb-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#1f4bb7] to-[#2557c9] hover:shadow-md hover:shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
