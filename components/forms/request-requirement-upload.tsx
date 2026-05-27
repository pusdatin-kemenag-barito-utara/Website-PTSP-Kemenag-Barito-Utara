"use client";
 
import { useState, useEffect, useRef } from "react";
import { FileCheck2, Eye, X, FileText, Image as ImageIcon, Loader2, UploadCloud } from "lucide-react";
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
  const [dragActive, setDragActive] = useState<Record<string, boolean>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [previewModal, setPreviewModal] = useState<{ url: string; name: string; type: string } | null>(null);

  const intervalRefs = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    return () => {
      Object.values(intervalRefs.current).forEach(clearInterval);
    };
  }, []);

  // Reset uploaded files when requirements list changes to prevent crossover & memory leaks
  useEffect(() => {
    Object.values(uploadedFiles).forEach((uploaded) => {
      if (uploaded.previewUrl) {
        URL.revokeObjectURL(uploaded.previewUrl);
      }
    });
    setUploadedFiles({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(requirements)]);

  const processFile = async (requirement: any, file: File) => {
    const reqId = String(requirement.id);
    const docName = requirement.documentName;
    const originalSize = file.size;
    
    // Validasi Ekstensi
    const allowedExtensions = (requirement.allowedExtensions || "pdf,jpg,jpeg,png")
      .split(",")
      .map((ext: string) => ext.trim().toLowerCase());
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";

    if (!allowedExtensions.includes(fileExtension)) {
      toast.error(`Format File Salah!`, {
        description: `Format yang diizinkan hanya: ${allowedExtensions.join(", ")}.`,
        duration: 5000,
      });
      return;
    }

    setProcessingFiles(prev => ({ ...prev, [reqId]: true }));
    setUploadProgress(prev => ({ ...prev, [reqId]: 15 }));

    try {
      // Smooth progress animation simulation during file reading/compression
      let progress = 15;
      intervalRefs.current[reqId] = setInterval(() => {
        progress = Math.min(progress + 15, 85);
        setUploadProgress(prev => ({ ...prev, [reqId]: progress }));
      }, 70);

      let fileToUpload = file;
      let isCompressed = false;

      // Kompresi jika file adalah Gambar (JPG/PNG) dan ukurannya > 800 KB
      if (file.type.startsWith("image/") && file.size > 800 * 1024) {
        fileToUpload = await compressImageToUnder(file, 800);
        if (fileToUpload.size < file.size) {
          isCompressed = true;
        }
      }

      clearInterval(intervalRefs.current[reqId]);
      delete intervalRefs.current[reqId];
      setUploadProgress(prev => ({ ...prev, [reqId]: 95 }));

      // 2. Validasi Ukuran Akhir (terutama untuk PDF)
      const maxSizeMb = requirement.maxFileSizeMb || 5;
      const maxSizeBytes = maxSizeMb * 1024 * 1024;
      if (fileToUpload.size > maxSizeBytes) {
        toast.error(`File Terlalu Besar!`, {
          description: `Batas maksimal adalah ${maxSizeMb} MB.`,
          duration: 5000,
        });
        setUploadProgress(prev => ({ ...prev, [reqId]: 0 }));
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

      setUploadProgress(prev => ({ ...prev, [reqId]: 100 }));
      setTimeout(() => {
        setUploadProgress(prev => ({ ...prev, [reqId]: 0 }));
      }, 400);

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
      setUploadProgress(prev => ({ ...prev, [reqId]: 0 }));
    } finally {
      setProcessingFiles(prev => ({ ...prev, [reqId]: false }));
    }
  };
 
  const handleFileChange = async (requirement: any, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(requirement, file);
    e.target.value = ""; // Reset file input agar file yang sama bisa dipilih lagi jika dihapus
  };
 
  const handleDrag = (reqId: string, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(prev => ({ ...prev, [reqId]: true }));
    } else if (e.type === "dragleave") {
      setDragActive(prev => ({ ...prev, [reqId]: false }));
    }
  };

  const handleDrop = async (requirement: any, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const reqId = String(requirement.id);
    setDragActive(prev => ({ ...prev, [reqId]: false }));

    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await processFile(requirement, file);
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
  };
 
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
 
  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
        <div className="mb-5">
          <p className="text-xs font-black uppercase tracking-[0.15em] text-[#059669]">
            Langkah 3
          </p>
          <h3 className="mt-1 text-lg font-black text-slate-900 sm:text-xl">
            Upload Dokumen Persyaratan
          </h3>
          <p className="mt-1.5 text-sm font-medium text-slate-500 leading-relaxed">
            Unggah dokumen persyaratan dengan format yang ditentukan. Silakan tarik & lepas file ke area yang tersedia.
          </p>
        </div>
 
        {requirements.length ? (
          <div className="grid gap-5 md:grid-cols-2">
            {requirements.map((requirement: any) => {
              const reqId = String(requirement.id);
              const uploaded = uploadedFiles[reqId];
              const isProcessing = processingFiles[reqId];
              const isDragActive = dragActive[reqId];
              const extensions = (requirement.allowedExtensions || "pdf,jpg,jpeg,png");
 
              return (
                <div
                  key={requirement.id}
                  className={`group rounded-2xl border-2 transition-all duration-300 p-4 sm:p-5 flex flex-col justify-between ${
                    uploaded
                      ? "border-emerald-200 bg-emerald-50/20 shadow-sm"
                      : isDragActive
                      ? "border-[#059669] bg-emerald-50/30 scale-[1.02] shadow-md shadow-emerald-500/5"
                      : "border-slate-100 bg-slate-50/30 hover:border-slate-200 hover:bg-slate-50/50"
                  }`}
                >
                  <div>
                    <label className="mb-3 block text-sm font-bold text-slate-800 leading-snug">
                      {requirement.documentName}
                      {requirement.isRequired && <span className="ml-1 text-rose-500 font-extrabold">*</span>}
                    </label>
 
                    {/* Tampilan File Terpilih */}
                    {uploaded ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 rounded-2xl bg-white border border-emerald-200/60 p-3 shadow-sm transition-all duration-300">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100/70 text-emerald-600 shadow-inner">
                            {uploaded.file.type.startsWith("image/") ? (
                              <ImageIcon className="h-5 w-5" />
                            ) : (
                              <FileText className="h-5 w-5" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold text-slate-800">{uploaded.file.name}</p>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                {formatSize(uploaded.file.size)}
                              </span>
                              {uploaded.compressedSize && (
                                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-100/40 px-2 py-0.5 rounded-md">
                                  Hemat {Math.round(((uploaded.originalSize - uploaded.compressedSize) / uploaded.originalSize) * 100)}%
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {uploaded.previewUrl && (
                              <button
                                type="button"
                                onClick={() => setPreviewModal({ url: uploaded.previewUrl!, name: requirement.documentName, type: uploaded.file.type })}
                                className="p-2 text-slate-400 hover:text-[#059669] hover:bg-emerald-50 rounded-xl transition-all"
                                title="Lihat Berkas"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeFile(reqId)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                              title="Hapus Berkas"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Drag & Drop Area */
                      <div
                        onDragEnter={(e) => handleDrag(reqId, e)}
                        onDragOver={(e) => handleDrag(reqId, e)}
                        onDragLeave={(e) => handleDrag(reqId, e)}
                        onDrop={(e) => handleDrop(requirement, e)}
                        onClick={() => document.getElementById(`file_input_${requirement.id}`)?.click()}
                        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-300 min-h-[145px] ${
                          isDragActive
                            ? "border-[#059669] bg-emerald-50/20"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/40"
                        }`}
                      >
                        <input
                          id={`file_input_${requirement.id}`}
                          type="file"
                          required={requirement.isRequired}
                          accept={extensions.split(",").map((ext: string) => `.${ext.trim()}`).join(",")}
                          onChange={(e) => handleFileChange(requirement, e)}
                          className="hidden"
                          disabled={isProcessing}
                        />
                        
                        {isProcessing ? (
                          <div className="space-y-3 w-full animate-in fade-in duration-300">
                            <Loader2 className="mx-auto h-7 w-7 animate-spin text-[#059669]" />
                            <div className="text-xs font-bold text-slate-700">Sedang Memproses Berkas...</div>
                            {uploadProgress[reqId] > 0 && (
                              <div className="space-y-1.5 w-full max-w-[200px] mx-auto">
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/20 shadow-inner">
                                  <div
                                    className="h-full bg-gradient-to-r from-[#059669] to-[#10b981] rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress[reqId]}%` }}
                                  />
                                </div>
                                <div className="text-[10px] font-black text-slate-400">{uploadProgress[reqId]}% SELESAI</div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="group-hover:scale-102 transition-transform duration-300 flex flex-col items-center">
                            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 shadow-sm border border-slate-100 group-hover:bg-emerald-50 group-hover:text-[#059669] transition-all duration-300">
                              <UploadCloud className="h-5 w-5" />
                            </div>
                            <p className="text-xs font-bold text-slate-700">
                              Seret & lepas berkas, atau <span className="text-[#059669] hover:underline font-extrabold">Pilih Berkas</span>
                            </p>
                            <p className="mt-1.5 text-[10px] text-slate-400 font-semibold tracking-wide">
                              Format: {extensions.toUpperCase()} (Maks: {requirement.maxFileSizeMb || 5}MB)
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
 
                  <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 font-semibold border-t border-slate-100/50 pt-2.5">
                    <span className="truncate mr-2 uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">Format: {extensions}</span>
                    <span className="shrink-0 font-bold text-[#059669] bg-emerald-50 px-2 py-0.5 rounded-md">Batas: {requirement.maxFileSizeMb || 5} MB</span>
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
                <div className="flex items-center justify-center min-h-[300px]">
                  <img src={previewModal.url} alt={previewModal.name} className="w-full h-auto object-contain" />
                </div>
              ) : (
                <>
                  {/* Tampilan Desktop: Tetap pakai iframe */}
                  <iframe src={previewModal.url} className="hidden md:block w-full h-[75vh] border-0" />
                  
                  {/* Tampilan Mobile/Tablet: Pakai tombol Buka di Tab Baru */}
                  <div className="md:hidden flex flex-col items-center justify-center text-center p-8 min-h-[300px]">
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mx-auto">
                      <FileText className="h-10 w-10" />
                    </div>
                    <h5 className="text-lg font-bold text-slate-900 mb-2">Preview PDF</h5>
                    <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto">
                      PDF dibuka di tab baru untuk kenyamanan tampilan di perangkat seluler.
                    </p>
                    <a 
                      href={previewModal.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex h-12 items-center justify-center px-8 rounded-xl bg-[#059669] text-white font-bold shadow-lg shadow-emerald-500/20 hover:bg-[#047857] transition-all active:scale-95"
                    >
                      Buka di Tab Baru
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
