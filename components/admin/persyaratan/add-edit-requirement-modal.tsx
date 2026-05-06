import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";

export function AddEditRequirementModal({
  isOpen,
  editingRequirement,
  items,
  formData,
  isPending,
  onClose,
  onChangeFormData,
  onExtensionChange,
  onSubmit,
}: {
  isOpen: boolean;
  editingRequirement: any | null;
  items: any[];
  formData: any;
  isPending: boolean;
  onClose: () => void;
  onChangeFormData: (updates: any) => void;
  onExtensionChange: (ext: string, checked: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <AnimatePresence>
      {(isOpen || editingRequirement) && (
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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl z-50 border border-slate-200/60"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10">
              <h3 className="text-lg font-black text-slate-800">
                {editingRequirement
                  ? "Edit Dokumen Persyaratan"
                  : "Tambah Dokumen Persyaratan"}
              </h3>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-slate-200/50 text-slate-400 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={onSubmit} className="p-6 space-y-5">
              <Field label="Item Layanan" required>
                <Select
                  name="service_item_id"
                  value={formData.service_item_id}
                  onChange={(e) =>
                    onChangeFormData({ service_item_id: e.target.value })
                  }
                  required
                  className="font-medium"
                >
                  <option value="">-- Pilih Item Layanan --</option>
                  {(items ?? []).map((item: any) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field
                label="Nama Dokumen"
                required
                hint="Nama dokumen yang harus diupload (misal: Kartu Keluarga)"
              >
                <Input
                  name="document_name"
                  value={formData.document_name}
                  onChange={(e) =>
                    onChangeFormData({ document_name: e.target.value })
                  }
                  required
                  placeholder="Contoh: KTP Asli"
                  className="font-medium"
                />
              </Field>

              <Field label="Deskripsi / Keterangan Tambahan">
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={(e) =>
                    onChangeFormData({ description: e.target.value })
                  }
                  placeholder="Contoh: Harus yang terbaru dan berwarna..."
                  className="min-h-[100px] resize-none"
                />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                  label="Ekstensi File Diizinkan"
                  required
                  hint="Pilih format file yang boleh diupload"
                >
                  <div className="flex flex-wrap gap-2 mt-2">
                    {[
                      "pdf",
                      "jpg",
                      "jpeg",
                      "png",
                      "doc",
                      "docx",
                      "xls",
                      "xlsx",
                    ].map((ext) => {
                      const currentExts = formData.allowed_extensions
                        ? formData.allowed_extensions
                            .split(",")
                            .map((e: string) => e.trim())
                        : [];
                      const isChecked = currentExts.includes(ext);

                      return (
                        <label
                          key={ext}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-colors ${isChecked ? "bg-blue-50 border-blue-200 text-[#1f4bb7]" : "bg-slate-50 border-slate-200/60 text-slate-500 hover:bg-slate-100"}`}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={isChecked}
                            onChange={(e) =>
                              onExtensionChange(ext, e.target.checked)
                            }
                          />
                          {ext.toUpperCase()}
                        </label>
                      );
                    })}
                  </div>
                </Field>

                <Field label="Maksimal Ukuran File (MB)" required>
                  <Input
                    type="number"
                    name="max_file_size_mb"
                    value={formData.max_file_size_mb}
                    onChange={(e) =>
                      onChangeFormData({
                        max_file_size_mb: parseInt(e.target.value) || 1,
                      })
                    }
                    required
                  />
                </Field>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/60 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={formData.is_required}
                      onChange={(e) =>
                        onChangeFormData({ is_required: e.target.checked })
                      }
                      className="peer sr-only"
                    />
                    <div className="w-10 h-6 bg-slate-300 rounded-full peer-checked:bg-rose-500 transition-colors relative after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">
                      Wajib Diupload (Required)
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Pemohon tidak bisa mengirim pengajuan jika dokumen ini
                      belum diupload.
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
