"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, CheckCircle, Send, MessageCircle } from "lucide-react";
import { uploadSuratCutiSelesai } from "@/lib/actions/admin/admin-cuti";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export function AdminCutiUploadModal({
  isOpen,
  onClose,
  cutiId,
  cutiName,
  noHp,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  cutiId: string;
  cutiName: string;
  noHp?: string;
  onSuccess?: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const validateAndSetFile = (selected: File) => {
    if (selected.type !== "application/pdf") {
      toast.error("Hanya file PDF yang diperbolehkan.");
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB.");
      return;
    }
    setFile(selected);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) validateAndSetFile(dropped);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Silakan pilih file PDF terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    toast.loading("Mengunggah dokumen dan mengirim WhatsApp...", { id: "upload-cuti" });

    const formData = new FormData();
    formData.append("dokumen", file);

    const res = await uploadSuratCutiSelesai(cutiId, formData);

    setIsSubmitting(false);

    if (res.error) {
      toast.error(res.error, { id: "upload-cuti" });
    } else {
      toast.success("Dokumen berhasil diunggah dan dikirim via WA!", { id: "upload-cuti" });
      onSuccess?.();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md pointer-events-auto overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  Upload Surat Cuti
                </h3>
                <button
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="mb-5">
                  <p className="text-sm text-slate-600 mb-1">
                    Upload PDF Surat Cuti (sudah ditandatangani & distempel) untuk:
                  </p>
                  <p className="font-semibold text-slate-900 mb-3">{cutiName}</p>

                  {/* WA Info */}
                  <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 mb-4">
                    <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      Setelah upload, notifikasi WhatsApp + file PDF akan otomatis dikirim ke pegawai
                      {noHp ? <strong> ({noHp})</strong> : "."}
                    </span>
                  </div>

                  <div
                    className={`relative group border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                      isDragging
                        ? "border-emerald-500 bg-emerald-50 scale-[1.01]"
                        : file
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-slate-300 hover:border-emerald-500 hover:bg-slate-50"
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      disabled={isSubmitting}
                    />
                    {file ? (
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                        <p className="text-sm font-medium text-emerald-700">{file.name}</p>
                        <p className="text-xs text-emerald-600/70">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setFile(null); }}
                          className="text-xs text-red-500 hover:underline mt-1"
                        >
                          Hapus & pilih ulang
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors ${
                          isDragging ? "bg-emerald-100" : "bg-slate-100 group-hover:bg-emerald-100"
                        }`}>
                          <Upload className={`w-6 h-6 transition-colors ${
                            isDragging ? "text-emerald-600" : "text-slate-400 group-hover:text-emerald-600"
                          }`} />
                        </div>
                        <p className="text-sm font-medium text-slate-700">
                          {isDragging ? "Lepaskan file di sini" : "Tarik & lepas atau klik untuk pilih"}
                        </p>
                        <p className="text-xs text-slate-500">PDF saja · Maks. 5MB</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={!file || isSubmitting}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Send className="w-4 h-4 mr-1.5" />
                    {isSubmitting ? "Mengirim..." : "Upload & Kirim WA"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
