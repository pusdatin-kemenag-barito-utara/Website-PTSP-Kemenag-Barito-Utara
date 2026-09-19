import { motion as m, AnimatePresence } from "framer-motion";
import { X, Loader2, Check, Building2, Layers, Clock, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { ModernSelect } from "@/components/ui/modern-select";

export function AddEditItemModal({
  isOpen,
  editingItem,
  services,
  formData,
  isPending,
  onClose,
  onChangeName,
  onChangeFormData,
  onSubmit,
}: {
  isOpen: boolean;
  editingItem: any | null;
  services: any[];
  formData: any;
  isPending: boolean;
  onClose: () => void;
  onChangeName: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeFormData: (updates: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const serviceOptions = (services ?? []).map((s: any) => ({
    value: String(s.id),
    label: s.name,
    icon: Building2,
  }));

  return (
    <AnimatePresence>
      {(isOpen || editingItem) && (
        <>
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50"
            onClick={onClose}
          />
          <m.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[94vw] max-w-xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl sm:rounded-3xl shadow-2xl z-50 border border-slate-200/80 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-200/60 shrink-0">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">
                    {editingItem ? "Edit Item Layanan" : "Tambah Item Layanan Baru"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sesuaikan nama layanan turunan, slug URL, dan estimasi penyelesaian.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0"
                title="Tutup Modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={onSubmit} className="p-6 space-y-4 text-xs">
              <Field label="Induk Layanan" required hint="Layanan utama penanggung jawab">
                <ModernSelect
                  options={serviceOptions}
                  value={formData.serviceId ? String(formData.serviceId) : ""}
                  onChange={(val) => onChangeFormData({ serviceId: val })}
                  placeholder="-- Pilih Induk Layanan --"
                  icon={Building2}
                  enableSearch={serviceOptions.length > 5}
                  required
                />
              </Field>

              <Field label="Nama Item Layanan" required hint="Nama jenis permohonan spesifik">
                <Input
                  name="name"
                  value={formData.name}
                  onChange={onChangeName}
                  required
                  placeholder="Contoh: Legalisir SK / Rekomendasi Penelitian"
                  className="font-medium text-xs"
                />
              </Field>

              <Field
                label="Slug URL (Otomatis)"
                hint="Dibuat otomatis dari nama item untuk URL tautan publik"
              >
                <div className="flex items-center">
                  <span className="bg-slate-100 border border-slate-200 border-r-0 rounded-l-xl px-3 py-2 text-xs text-slate-500 font-mono">
                    /
                  </span>
                  <Input
                    name="slug"
                    value={formData.slug}
                    onChange={(e) => onChangeFormData({ slug: e.target.value })}
                    required
                    className="rounded-l-none font-mono text-xs text-emerald-700 font-semibold"
                  />
                </div>
              </Field>

              <Field 
                label="Estimasi Waktu Pengerjaan" 
                hint="Ketik kustom atau pilih preset simetris di bawah ini"
              >
                <div className="space-y-2">
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                    <Input
                      name="estimatedTime"
                      value={formData.estimatedTime || ""}
                      onChange={(e) =>
                        onChangeFormData({ estimatedTime: e.target.value })
                      }
                      placeholder="Contoh: 1-3 Hari Kerja / 1 Minggu"
                      className="font-medium text-xs pl-9"
                    />
                  </div>

                  {/* Preset Pilihan Cepat Dinamis: Grid Simetris 4 Kolom */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-0.5">
                    {[
                      "15–30 Menit",
                      "1–2 Jam",
                      "1 Hari Kerja",
                      "1–3 Hari Kerja",
                      "3–5 Hari Kerja",
                      "1 Minggu",
                      "2–4 Minggu",
                      "1 Bulan",
                    ].map((preset) => {
                      const isSelected = formData.estimatedTime === preset;
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => onChangeFormData({ estimatedTime: preset })}
                          className={`text-[11px] font-bold py-1.5 px-2 rounded-xl border text-center transition-all cursor-pointer truncate ${
                            isSelected
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                          }`}
                        >
                          {preset}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </Field>

              {/* Status Aktif Interactive Card */}
              <div className="pt-1">
                <label className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  formData.isActive 
                    ? "bg-emerald-50/50 border-emerald-200/80 shadow-2xs" 
                    : "bg-slate-50 border-slate-200/80"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${formData.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"}`}>
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {formData.isActive ? "Status: Aktif" : "Status: Nonaktif"}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {formData.isActive 
                          ? "Item layanan tampil dan dapat dipilih pemohon." 
                          : "Item layanan disembunyikan sementara dari publik."}
                      </p>
                    </div>
                  </div>
                  <div className="relative inline-flex items-center shrink-0">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        onChangeFormData({ isActive: e.target.checked })
                      }
                      className="peer sr-only"
                    />
                    <div className="w-10 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 cursor-pointer"></div>
                  </div>
                </label>
              </div>

              {/* Sticky Footer */}
              <div className="flex items-center justify-end gap-2.5 sticky bottom-0 bg-white border-t border-slate-100 pt-4 -mx-6 -mb-6 px-6 pb-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs hover:shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}
