import { motion as m, AnimatePresence } from "framer-motion";
import { X, Loader2, Check, Image as ImageIcon, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { fetchAPI } from "@/lib/api";
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
  const [roleOptions, setRoleOptions] = useState<{ value: string; label: string }[]>([]);
  const [bannerUrl, setBannerUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchAPI<any>("/master-options")
      .then((res) => {
        if (res?.success && Array.isArray(res?.data)) {
          const roles = res.data
            .filter((o: any) => o.category === "role_admin" && o.is_active !== false && o.value.startsWith("admin_") && o.value !== "admin_ptsp")
            .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
            .map((o: any) => ({ value: o.value, label: o.label }));
          setRoleOptions(roles);
        }
      })
      .catch(() => {});
  }, []);

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
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50"
            onClick={onClose}
          />
          <m.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-4xl lg:max-w-5xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl z-50 border border-slate-200/80 overflow-hidden"
          >
            {/* 1. Header (Sticky Top) */}
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 bg-slate-50/60 shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  {editingService ? "Edit Layanan" : "Tambah Layanan Baru"}
                  {editingService?.category && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 uppercase">
                      {editingService.category}
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Sesuaikan nama, slug, hak akses bidang, persyaratan berkas & banner visual
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 transition-colors"
                title="Tutup Modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* 2. Main Form Body (Wraps both columns so banner input is naturally included in form) */}
            <form onSubmit={onSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-5 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

                  {/* Kolom Kiri: Informasi & Pengaturan Layanan (7 Kolom di Desktop) */}
                  <div className="lg:col-span-7 space-y-3.5">
                    {/* Field 1: Nama Layanan */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nama Layanan <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={onChangeName}
                        required
                        placeholder="Contoh: Pelayanan Pendidik dan Tenaga Kependidikan"
                        className="h-9 text-xs font-semibold text-slate-800"
                      />
                    </div>

                    {/* Field 2 & 3: Slug URL & Pemilik Layanan (Grid 2 Kolom) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Slug URL <span className="text-[10px] text-slate-400 font-normal">(Otomatis)</span>
                        </label>
                        <div className="flex items-center">
                          <span className="bg-slate-100 border border-slate-200 border-r-0 rounded-l-lg px-2.5 h-9 flex items-center text-xs text-slate-500 font-mono">
                            /
                          </span>
                          <Input
                            name="slug"
                            value={formData.slug}
                            onChange={(e) => onChangeFormData({ slug: e.target.value })}
                            required
                            className="h-9 rounded-l-none font-mono text-xs text-emerald-700 font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Pemilik Layanan <span className="text-[10px] text-slate-400 font-normal">(Hak Akses)</span>
                        </label>
                        <Select
                          name="roleOwner"
                          value={formData.roleOwner || ""}
                          onChange={(e) => onChangeFormData({ roleOwner: e.target.value })}
                          className="h-9 text-xs font-medium"
                        >
                          <option value="">-- Semua Bidang / Super Admin --</option>
                          {roleOptions.map((role) => (
                            <option key={role.value} value={role.value}>
                              {role.label}
                            </option>
                          ))}
                        </Select>
                      </div>
                    </div>

                    {/* Field 4: Persyaratan Berkas */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">
                          Persyaratan Berkas
                        </label>
                        <span className="text-[10px] text-slate-400 font-medium">Baris baru tiap poin</span>
                      </div>
                      <Textarea
                        name="requirementsText"
                        value={formData.requirementsText || ""}
                        onChange={(e) => onChangeFormData({ requirementsText: e.target.value })}
                        placeholder="- Fotokopi KTP&#10;- Surat Permohonan"
                        rows={3}
                        className="text-xs font-medium min-h-[76px] resize-y"
                      />
                    </div>

                    {/* Field 5 & 6: Link SOP & Status Aktif (Grid 2 Kolom) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Link SOP <span className="text-[10px] text-slate-400 font-normal">(Google Drive / PDF)</span>
                        </label>
                        <Input
                          name="sopUrl"
                          type="url"
                          value={formData.sopUrl || ""}
                          onChange={(e) => onChangeFormData({ sopUrl: e.target.value })}
                          placeholder="https://..."
                          className="h-9 text-xs font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Status Publikasi
                        </label>
                        <label className="flex items-center justify-between h-9 px-3 rounded-lg border border-slate-200/80 bg-slate-50/70 hover:bg-slate-100/70 cursor-pointer transition-colors">
                          <span className="text-xs font-semibold text-slate-700">
                            {formData.isActive ? "Layanan Aktif" : "Non-Aktif (Draft)"}
                          </span>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={Boolean(formData.isActive)}
                              onChange={(e) => onChangeFormData({ isActive: e.target.checked })}
                              className="peer sr-only"
                            />
                            <div className="w-8 h-4.5 bg-slate-300 rounded-full peer-checked:bg-emerald-600 transition-colors relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:after:translate-x-3.5" />
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Kolom Kanan: Visual Banner & Upload (5 Kolom di Desktop) */}
                  <div className="lg:col-span-5 bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 flex flex-col justify-between gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <ImageIcon className="h-3.5 w-3.5 text-emerald-600" />
                        Banner Layanan
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium font-mono">Portrait 3:4</span>
                    </div>

                    {/* Preview Box */}
                    <div className="relative w-full max-w-[200px] sm:max-w-[220px] aspect-[3/4] mx-auto rounded-xl overflow-hidden border border-slate-200 bg-white shadow-xs group">
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
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-slate-400">
                          <ImageIcon className="h-8 w-8 mb-2 text-slate-300" />
                          <p className="text-xs font-bold text-slate-600">Belum Ada Banner</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Upload banner portrait 3:4</p>
                        </div>
                      )}
                    </div>

                    {/* Upload Button & Status */}
                    <div className="space-y-1.5 pt-1">
                      <label className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer text-xs font-bold text-slate-700 shadow-2xs hover:border-emerald-300 transition-all text-center">
                        <Upload className="h-3.5 w-3.5 text-emerald-600" />
                        <span>{previewUrl ? "Ganti File Banner" : "Pilih File Banner"}</span>
                        <input
                          type="file"
                          name="banner"
                          accept="image/png, image/jpeg, image/webp"
                          className="sr-only"
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
                      </label>

                      {editingService && !bannerError && !previewUrl && (
                        <p className="text-[11px] font-semibold text-emerald-700 flex items-center justify-center gap-1">
                          <Check className="h-3.5 w-3.5" /> File banner saat ini sudah terpasang
                        </p>
                      )}
                      {previewUrl && (
                        <p className="text-[11px] font-semibold text-emerald-700 flex items-center justify-center gap-1">
                          <Check className="h-3.5 w-3.5" /> File baru siap diunggah saat simpan
                        </p>
                      )}
                      <p className="text-[10px] text-slate-400 text-center">
                        Format: JPG, PNG, WEBP. Maks 2MB.
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* 3. Footer Actions (Full Width Sticky Bottom) */}
              <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
                <span className="text-xs text-slate-400 hidden sm:inline">
                  Perubahan akan langsung terupdate di katalog publik
                </span>
                <div className="flex items-center gap-2.5 ml-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </form>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}
