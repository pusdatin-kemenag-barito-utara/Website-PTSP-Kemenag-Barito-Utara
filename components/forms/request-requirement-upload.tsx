"use client";

import { useState } from "react";
import { FileCheck2, Eye, X, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { compressImageToUnder } from "@/lib/image-compression";

type UploadedFile = {
  reqId: string;
  file: File;
  previewUrl?: string;
  originalSize: number;
  compressedSize?: number;
};

export function RequestRequirementUpload({
  requirements,
  onFilesChange,
}: {
  requirements: any[];
  onFilesChange?: (files: Record<string, File>) => void;
}) {
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFile>>({});
  const [processingFiles, setProcessingFiles] = useState<Record<string, boolean>>({});
  const [previewModal, setPreviewModal] = useState<{ url: string; name: string; type: string } | null>(null);

  const handleFileChange = async (requirement: any, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reqId = String(requirement.id);
    const docName = requirement.document_name;
    const originalSize = file.size;
    
    // Validasi Ekstensi
    const allowedExtensions = (requirement.allowed_extensions || "pdf,jpg,jpeg,png")
      .split(",")
      .map((ext: string) => ext.trim().toLowerCase());
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";

    if (!allowedExtensions.includes(fileExtension)) {
      toast.error(`Format File Salah!`, {
        description: `Format yang diizinkan hanya: ${allowedExtensions.join(", ")}.`,
        duration: 5000,
      });
      e.target.value = "";
      return;
    }

    setProcessingFiles(prev => ({ ...prev, [reqId]: true }));

    try {
      let fileToUpload = file;
      let isCompressed = false;

      // Kompresi jika file adalah Gambar (JPG/PNG)
      if (file.type.startsWith("image/") && file.size > 800 * 1024) {
        fileToUpload = await compressImageToUnder(file, 800);
        if (fileToUpload.size < file.size) {
          isCompressed = true;
        }
      }

      // 2. Validasi Ukuran Akhir (terutama untuk PDF)
      const maxSizeMb = requirement.max_file_size_mb || 5;
      const maxSizeBytes = maxSizeMb * 1024 * 1024;
      if (fileToUpload.size > maxSizeBytes) {
        toast.error(`File Terlalu Besar!`, {
          description: `Batas maksimal adalah ${maxSizeMb} MB.`,
          duration: 5000,
        });
        e.target.value = "";
        return;
      }

      // Buat preview URL
      let previewUrl: string | undefined;
      if (fileToUpload.type.startsWith("image/") || fileToUpload.type === "application/pdf") {
        previewUrl = URL.createObjectURL(fileToUpload);
      }

      // Update state
      const newUploadedFiles = {
        ...uploadedFiles,
        [reqId]: {
          reqId,
          file: fileToUpload,
          previewUrl,
          originalSize,
          compressedSize: isCompressed ? fileToUpload.size : undefined,
        },
      };

      setUploadedFiles(newUploadedFiles);
      if (onFilesChange) {
        const filesOnly: Record<string, File> = {};
        Object.entries(newUploadedFiles).forEach(([id, data]) => {
          filesOnly[id] = data.file;
        });
        onFilesChange(filesOnly);
      }

      if (isCompressed) {
        toast.success(`Gambar Berhasil Dioptimasi!`, {
          description: `Ukuran diperkecil dari ${(originalSize / 1024).toFixed(0)}KB menjadi ${(fileToUpload.size / 1024).toFixed(0)}KB.`,
        });
      } else {
        toast.success(`${docName} berhasil dipilih!`);
      }
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Gagal memproses file.");
    } finally {
      setProcessingFiles(prev => ({ ...prev, [reqId]: false }));
    }
  };

  const removeFile = (reqId: string) => {
    if (uploadedFiles[reqId]?.previewUrl) {
      URL.revokeObjectURL(uploadedFiles[reqId].previewUrl!);
    }
    const newFiles = { ...uploadedFiles };
    delete newFiles[reqId];
    setUploadedFiles(newFiles);

    if (onFilesChange) {
      const filesOnly: Record<string, File> = {};
      Object.entries(newFiles).forEach(([id, data]) => {
        filesOnly[id] = data.file;
      });
      onFilesChange(filesOnly);
    }
    
    // Reset input manual
    const input = document.querySelector(`input[name="requirement_${reqId}"]`) as HTMLInputElement;
    if (input) input.value = "";
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-5">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#059669]">
            Langkah 3
          </p>
          <h3 className="mt-1 text-base font-bold text-slate-900 sm:text-lg">
            Upload Dokumen Persyaratan
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Unggah dokumen sesuai format yang ditentukan. Pastikan ukuran file sesuai batas maksimal.
          </p>
        </div>

        {requirements.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {requirements.map((requirement: any) => {
              const reqId = String(requirement.id);
              const uploaded = uploadedFiles[reqId];
              const isProcessing = processingFiles[reqId];
              const extensions = (requirement.allowed_extensions || "pdf,jpg,jpeg,png");

              return (
                <div
                  key={requirement.id}
                  className={`rounded-xl border-2 transition-all duration-300 p-3 sm:p-4 ${
                    uploaded
                      ? "border-emerald-300 bg-emerald-50/50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <label className="mb-2 block text-sm font-semibold text-slate-800">
                    {requirement.document_name}
                    {requirement.is_required && <span className="ml-1 text-rose-500">*</span>}
                  </label>

                  {/* Input File - Selalu ada di DOM agar FormData menemukannya */}
                  <div className={uploaded ? "hidden" : "relative"}>
                    <input
                      type="file"
                      name={`requirement_${requirement.id}`}
                      required={requirement.is_required && !uploaded}
                      accept={extensions.split(",").map((ext: string) => `.${ext.trim()}`).join(",")}
                      onChange={(e) => handleFileChange(requirement, e)}
                      className="w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-[#059669] file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white"
                      disabled={isProcessing}
                    />
                    {isProcessing && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/80">
                        <Loader2 className="h-5 w-5 animate-spin text-[#059669]" />
                      </div>
                    )}
                  </div>

                  {/* Tampilan File Terpilih */}
                  {uploaded && (
                    <div className="flex items-center gap-3 rounded-lg bg-white border border-emerald-200 px-3 py-2">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                        {uploaded.file.type.startsWith("image/") ? (
                          <ImageIcon className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <FileText className="h-4 w-4 text-emerald-600" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-800">{uploaded.file.name}</p>
                        <p className="text-xs text-slate-500">{formatSize(uploaded.file.size)}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {uploaded.previewUrl && (
                          <button
                            type="button"
                            onClick={() => setPreviewModal({ url: uploaded.previewUrl!, name: requirement.document_name, type: uploaded.file.type })}
                            className="p-1.5 text-slate-400 hover:text-[#059669]"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeFile(reqId)}
                          className="p-1.5 text-slate-400 hover:text-rose-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="mt-1.5 flex items-center justify-between text-[10px] sm:text-xs text-slate-400">
                    <span>Format: {extensions}</span>
                    <span className="font-medium text-slate-500">Maks: {requirement.max_file_size_mb || 5} MB</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Item layanan ini tidak memiliki dokumen wajib.</p>
        )}
      </section>

      {/* Preview Modal */}
      {previewModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b px-5 py-3">
              <h4 className="text-sm font-bold text-slate-800 truncate">{previewModal.name}</h4>
              <button onClick={() => setPreviewModal(null)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-2">
              {previewModal.type.startsWith("image/") ? (
                <img src={previewModal.url} alt={previewModal.name} className="w-full h-auto object-contain" />
              ) : (
                <iframe src={previewModal.url} className="w-full h-[75vh] border-0" />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
