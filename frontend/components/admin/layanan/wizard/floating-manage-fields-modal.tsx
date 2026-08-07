"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { m, AnimatePresence } from "framer-motion";
import { 
  X, 
  FormInput, 
  ListChecks, 
  Layers, 
  Plus,
  Trash2,
  Pencil,
  Check,
  Loader2,
  FileText,
  FolderCheck
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { ModernSelect } from "@/components/ui/modern-select";
import { WizardFieldSection } from "./wizard-field-section";
import { WizardRequirementSection } from "./wizard-requirement-section";

interface FloatingManageFieldsModalProps {
  item: any | null;
  onClose: () => void;
  isSuperAdmin: boolean;
  fieldForms: any;
  fieldModals: any;
  reqForms: any;
  reqModals: any;
  handlers: any;
}

export function FloatingManageFieldsModal({
  item,
  onClose,
  isSuperAdmin,
  fieldForms,
  fieldModals,
  reqForms,
  reqModals,
  handlers,
}: FloatingManageFieldsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"form" | "req">("form");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (item) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      
      const preventWheelScroll = (e: WheelEvent) => {
        if ((e.target as HTMLElement).closest('.overflow-y-auto')) return;
        e.preventDefault();
      };

      const preventTouchScroll = (e: TouchEvent) => {
        if ((e.target as HTMLElement).closest('.overflow-y-auto')) return;
        e.preventDefault();
      };
      
      window.addEventListener("wheel", preventWheelScroll, { passive: false });
      window.addEventListener("touchmove", preventTouchScroll, { passive: false });

      return () => {
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.width = "";
        window.removeEventListener("wheel", preventWheelScroll);
        window.removeEventListener("touchmove", preventTouchScroll);
      };
    }
  }, [item]);

  if (!item || !mounted) return null;

  const formCount = item.serviceFormFields?.length || 0;
  const reqCount = item.serviceRequirements?.length || 0;

  const isFieldFormActive = fieldModals.isOpen || fieldModals.editing;
  const isReqFormActive = reqModals.isOpen || reqModals.editing;
  const showRightPanel = (activeTab === "form" && isFieldFormActive) || (activeTab === "req" && isReqFormActive);

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 pointer-events-auto overscroll-none backdrop-blur-xs">
        <m.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="relative w-[85vw] max-w-[1280px] bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 flex flex-col h-[90vh]"
        >
          {/* Clean & Elegant Header */}
          <div className="bg-white px-6 pt-5 pb-4 border-b border-slate-200/70 relative shrink-0">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-200/80 shadow-2xs transition-all duration-200 cursor-pointer group"
              aria-label="Tutup Modal"
            >
              <X className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-200/60">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                  Kelola Field & Persyaratan
                </span>
                <h3 className="text-lg font-black text-slate-800 tracking-tight mt-0.5">
                  {item.name}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Slug: {item.slug}
                </p>
              </div>
            </div>

            {/* Sub Tabs */}
            <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setActiveTab("form");
                  // Jika panel kanan sedang terbuka di tab persyaratan, langsung alihkan data ke form input baru
                  if (reqModals.isOpen || reqModals.editing) {
                    reqModals.setOpen(false);
                    reqModals.setEditing(null);
                    fieldModals.setEditing(null);
                    fieldForms.setData({
                      serviceItemId: item.id.toString(),
                      label: "",
                      name: "",
                      type: "text",
                      placeholder: "",
                      isRequired: true,
                      options: "",
                    });
                    fieldModals.setOpen(true);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "form"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                <FormInput className="h-4 w-4" />
                <span>Form Input ({formCount})</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("req");
                  // Jika panel kanan sedang terbuka di tab field, langsung alihkan data ke form dokumen persyaratan baru
                  if (fieldModals.isOpen || fieldModals.editing) {
                    fieldModals.setOpen(false);
                    fieldModals.setEditing(null);
                    reqModals.setEditing(null);
                    reqForms.setData({
                      serviceItemId: item.id.toString(),
                      documentName: "",
                      description: "",
                      isRequired: true,
                      allowedExtensions: "pdf,jpg,jpeg,png",
                      maxFileSizeMb: 5,
                    });
                    reqModals.setOpen(true);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "req"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                <ListChecks className="h-4 w-4" />
                <span>Persyaratan Dokumen ({reqCount})</span>
              </button>
            </div>
          </div>

          {/* Modal Body: Split Panel Static 2 Kolom Kiri (7) & Kanan (5) */}
          <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 bg-slate-50/50">
            {/* Panel Kiri: Daftar Items (Daftar Field / Daftar Syarat) */}
            <div className="md:col-span-7 p-6 overflow-y-auto max-h-[calc(90vh-140px)] border-r border-slate-200/60">
              {activeTab === "form" ? (
                <WizardFieldSection
                  item={item}
                  isSuperAdmin={isSuperAdmin}
                  fieldForms={fieldForms}
                  fieldModals={fieldModals}
                  deleteField={handlers.deleteField}
                  reorderFields={handlers.reorderFields}
                />
              ) : (
                <WizardRequirementSection
                  item={item}
                  isSuperAdmin={isSuperAdmin}
                  reqForms={reqForms}
                  reqModals={reqModals}
                  deleteReq={handlers.deleteReq}
                  reorderReqs={handlers.reorderReqs}
                />
              )}
            </div>

            {/* Panel Kanan: Form Input Editor Langsung Terbuka Serta Merta */}
            <div className="md:col-span-5 p-6 overflow-y-auto bg-white max-h-[calc(90vh-140px)] border-l border-slate-200/80 shadow-xs">
                {activeTab === "form" && isFieldFormActive && (
                  <div>
                    <div className="pb-3 mb-4 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4.5 w-4.5 text-emerald-600" />
                        <h4 className="text-sm font-black text-slate-800">
                          {fieldModals.editing ? "Edit Field Layanan" : "Tambah Field Baru"}
                        </h4>
                      </div>
                    </div>

                    <form onSubmit={fieldForms.onSubmit} className="space-y-4 text-xs">
                      <Field label="Label Field / Nama Kolom" required hint="Label yang akan tampil pada formulir pemohon">
                        <Input
                          name="label"
                          value={fieldForms.data.label || ""}
                          onChange={(e) => {
                            fieldForms.onChangeLabel(e);
                          }}
                          required
                          placeholder="Contoh: Nomor Sertifikat / NIK Pemohon"
                          className="font-medium text-xs"
                        />
                      </Field>

                      <Field label="Tipe Field / Jenis Input" required>
                        <ModernSelect
                          options={[
                            { value: "text", label: "Teks Singkat (Text Input)", icon: FileText },
                            { value: "textarea", label: "Teks Panjang (Textarea)", icon: FileText },
                            { value: "number", label: "Angka (Number)", icon: FileText },
                            { value: "date", label: "Pilihan Tanggal (Date Picker)", icon: FileText },
                            { value: "select", label: "Pilihan Dropdown (Select Box)", icon: FileText },
                            { value: "file", label: "Unggah Berkas (File Upload)", icon: FileText },
                          ]}
                          value={fieldForms.data.type || "text"}
                          onChange={(val: string) => fieldForms.setData((p: any) => ({ ...p, type: val }))}
                          placeholder="Pilih Tipe Field..."
                          icon={FileText}
                        />
                      </Field>

                      {fieldForms.data.type === "select" && (
                        <Field label="Opsi Pilihan Dropdown" required hint="Masukkan pilihan yang dipisahkan dengan koma (,)">
                          <Textarea
                            name="options"
                            value={fieldForms.data.options || ""}
                            onChange={(e) => fieldForms.setData((p: any) => ({ ...p, options: e.target.value }))}
                            placeholder="Contoh: Laki-laki, Perempuan"
                            className="min-h-[75px] text-xs resize-none"
                            required
                          />
                        </Field>
                      )}

                      <Field label="Placeholder / Petunjuk Isian (Opsional)">
                        <Input
                          name="placeholder"
                          value={fieldForms.data.placeholder || ""}
                          onChange={(e) => fieldForms.setData((p: any) => ({ ...p, placeholder: e.target.value }))}
                          placeholder="Contoh: Masukkan nomor sesuai sertifikat..."
                          className="font-medium text-xs"
                        />
                      </Field>

                      <label className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 cursor-pointer hover:bg-slate-100/80 transition-colors mt-2">
                        <input
                          type="checkbox"
                          checked={fieldForms.data.isRequired ?? true}
                          onChange={(e) => fieldForms.setData((p: any) => ({ ...p, isRequired: e.target.checked }))}
                          className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
                        />
                        <div>
                          <p className="font-bold text-slate-800 text-xs">Wajib Diisi oleh Pemohon</p>
                          <p className="text-[10px] text-slate-500">Pemohon tidak dapat mengirim formulir jika kolom ini kosong</p>
                        </div>
                      </label>

                      <div className="pt-3 flex justify-end border-t border-slate-100">
                        <button
                          type="submit"
                          className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
                        >
                          Simpan Field
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeTab === "req" && isReqFormActive && (
                  <div>
                    <div className="pb-3 mb-4 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <FolderCheck className="h-4.5 w-4.5 text-emerald-600" />
                        <h4 className="text-sm font-black text-slate-800">
                          {reqModals.editing ? "Edit Dokumen Persyaratan" : "Tambah Dokumen Persyaratan"}
                        </h4>
                      </div>
                    </div>

                    <form onSubmit={reqForms.onSubmit} className="space-y-4 text-xs">
                      <Field label="Nama Dokumen Persyaratan" required hint="Contoh: KTP Asli / Kartu Keluarga / Surat Pengantar">
                        <Input
                          name="documentName"
                          value={reqForms.data.documentName || ""}
                          onChange={(e) => reqForms.setData((p: any) => ({ ...p, documentName: e.target.value }))}
                          required
                          placeholder="Contoh: KTP Asli (Scan Berwarna)"
                          className="font-medium text-xs"
                        />
                      </Field>

                      <Field label="Deskripsi / Catatan Petunjuk">
                        <Textarea
                          name="description"
                          value={reqForms.data.description || ""}
                          onChange={(e) => reqForms.setData((p: any) => ({ ...p, description: e.target.value }))}
                          placeholder="Contoh: Berkas diunggah dengan format berwarna dan terbaca jelas..."
                          className="min-h-[75px] text-xs resize-none"
                        />
                      </Field>

                      <Field label="Ekstensi Berkas Diizinkan" required hint="Pilih tipe berkas yang diperbolehkan">
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {["pdf", "jpg", "jpeg", "png", "doc", "docx", "xls", "xlsx"].map((ext) => {
                            const currentExts = reqForms.data.allowedExtensions
                              ? reqForms.data.allowedExtensions.split(",").map((e: string) => e.trim())
                              : [];
                            const isChecked = currentExts.includes(ext);

                            return (
                              <button
                                type="button"
                                key={ext}
                                onClick={() => reqForms.onExtensionChange(ext)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold cursor-pointer transition-all ${
                                  isChecked 
                                    ? "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-2xs" 
                                    : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                                }`}
                              >
                                <span>.{ext}</span>
                              </button>
                            );
                          })}
                        </div>
                      </Field>

                      <Field label="Ukuran Maksimal Berkas (MB)">
                        <Input
                          type="number"
                          name="maxFileSizeMb"
                          value={reqForms.data.maxFileSizeMb || 5}
                          onChange={(e) => reqForms.setData((p: any) => ({ ...p, maxFileSizeMb: e.target.value }))}
                          min={1}
                          max={50}
                          className="font-medium text-xs"
                        />
                      </Field>

                      <label className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 cursor-pointer hover:bg-slate-100/80 transition-colors mt-2">
                        <input
                          type="checkbox"
                          checked={reqForms.data.isRequired ?? true}
                          onChange={(e) => reqForms.setData((p: any) => ({ ...p, isRequired: e.target.checked }))}
                          className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
                        />
                        <div>
                          <p className="font-bold text-slate-800 text-xs">Wajib Diunggah oleh Pemohon</p>
                          <p className="text-[10px] text-slate-500">Berkas ini harus dilampirkan sebelum mengajukan permohonan</p>
                        </div>
                      </label>

                      <div className="pt-3 flex justify-end border-t border-slate-100">
                        <button
                          type="submit"
                          className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
                        >
                          Simpan Dokumen
                        </button>
                      </div>
                    </form>
                  </div>
                )}
            </div>
          </div>
        </m.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
