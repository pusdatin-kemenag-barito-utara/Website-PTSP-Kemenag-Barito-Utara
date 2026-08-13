import { motion as m, AnimatePresence } from "framer-motion";
import { X, Loader2, Check, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { ADMIN_ROLES } from "@/lib/constants";
import { useState, useEffect } from "react";
import Image from "@/lib/next-compat/image";

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
  const [bannerError, setBannerError] = useState(false);
  const [bannerUrl, setBannerUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Update banner URL when modal opens or editingService is set
  useEffect(() => {
    setPreviewUrl(null);
    setBannerError(false);
    if (editingService) {
      const initialSlug = editingService.slug || formData.slug;
      if (initialSlug) {
        setBannerUrl(`/banners/${initialSlug}.png?t=${Date.now()}`);
      }
    } else if (formData.slug) {
      setBannerUrl(`/banners/${formData.slug}.png?t=${Date.now()}`);
    }
  }, [editingService, isOpen]);

  return (
    <AnimatePresence>
      {(isOpen || editingService) && (
        <>
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <m.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full ${editingService ? 'max-w-4xl' : 'max-w-lg'} max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl z-50 border border-slate-200/60`}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
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
            
            <div className={`flex flex-col ${editingService ? 'md:flex-row' : ''} h-full`}>
              {/* Form Section */}
              <form onSubmit={onSubmit} className="flex-1 p-6 space-y-5 flex flex-col justify-between">
                <div className="space-y-5">
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
                        className="rounded-l-none font-mono text-sm text-[#059669]"
                      />
                    </div>
                  </Field>

                  <Field
                    label="Pemilik Layanan (Hak Akses)"
                    hint="Admin dengan role ini yang berhak mengelola item layanan ini. Kosongkan jika dikelola oleh Super Admin."
                  >
                    <Select
                      name="roleOwner"
                      value={formData.roleOwner || ""}
                      onChange={(e) =>
                        onChangeFormData({ roleOwner: e.target.value })
                      }
                    >
                      <option value="">-- Semua Bidang / Super Admin --</option>
                      {ADMIN_ROLES.filter(
                        (r) => r.startsWith("admin_") && r !== "admin_ptsp",
                      ).map((role) => (
                        <option key={role} value={role}>
                          {role
                            .split("_")
                            .slice(1)
                            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                            .join(" ")}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <Field
                    label="Persyaratan Berkas"
                    hint="Opsional. Sebutkan berkas apa saja yang harus disiapkan. (Gunakan baris baru untuk setiap poin)"
                  >
                    <Textarea
                      name="requirementsText"
                      value={formData.requirementsText || ""}
                      onChange={(e) => onChangeFormData({ requirementsText: e.target.value })}
                      placeholder="- Fotokopi KTP&#10;- Surat Permohonan"
                      className="font-medium min-h-[100px]"
                    />
                  </Field>

                  <Field
                    label="Link SOP (Standar Operasional Prosedur)"
                    hint="Opsional. Masukkan URL tautan menuju dokumen SOP (misal: Google Drive/PDF)."
                  >
                    <Input
                      name="sopUrl"
                      type="url"
                      value={formData.sopUrl || ""}
                      onChange={(e) => onChangeFormData({ sopUrl: e.target.value })}
                      placeholder="https://..."
                      className="font-medium"
                    />
                  </Field>

                  <Field
                    label="Banner Layanan (Portrait 4x3)"
                    hint="Format: JPG/PNG/WEBP. Upload banner untuk ditampilkan di halaman depan. Kosongkan jika tidak ingin mengubah."
                  >
                    <div className="space-y-2">
                      <Input
                        type="file"
                        name="banner"
                        accept="image/png, image/jpeg, image/webp"
                        className="font-medium cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = URL.createObjectURL(file);
                            setPreviewUrl(url);
                            setBannerError(false);
                          } else {
                            setPreviewUrl(null);
                          }
                        }}
                      />
                      {editingService && !bannerError && (
                        <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                          <Check className="h-3 w-3" /> File banner saat ini sudah tersedia
                        </p>
                      )}
                    </div>
                  </Field>

                  <div className="pt-2">
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/60 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={Boolean(formData.isActive)}
                          onChange={(e) =>
                            onChangeFormData({ isActive: e.target.checked })
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
                </div>

                <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white border-t border-slate-100 pt-4 mt-6">
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
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#059669] to-[#047857] hover:shadow-md hover:shadow-emerald-500/25 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
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

              {/* Preview Section */}
              {editingService && (
                <div className="w-full md:w-72 lg:w-80 border-t md:border-t-0 md:border-l border-slate-100 bg-slate-50/50 p-6 flex flex-col shrink-0">
                  <h4 className="text-sm font-black uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" /> Preview Banner
                  </h4>
                  
                  <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 bg-white shadow-inner group">
                    {!bannerError && (previewUrl || bannerUrl) ? (
                      <Image
                        src={previewUrl || bannerUrl}
                        alt="Banner Preview"
                        fill
                        className="object-cover"
                        onError={() => setBannerError(true)}
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-400">
                        <ImageIcon className="h-10 w-10 mb-3 text-slate-300" />
                        <p className="text-sm font-bold text-slate-500">Belum Ada Banner</p>
                        <p className="text-xs mt-1">Upload banner pada form di samping untuk melihat preview.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}
