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
  hideHeader = false,
}: {
  requirements: any[];
  onFilesChange?: (files: Record<string, File>) => void;
  hideHeader?: boolean;
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

  // Lock scroll background when preview modal is open
  useEffect(() => {
    if (previewModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [previewModal]);

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
        duration: 3000,
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
          duration: 3000,
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
 
  if (!requirements || requirements.length === 0) {
    return null;
  }

  return (
    <>
      <section className={hideHeader ? "w-full" : "rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xs transition-colors duration-300"}>
        {!hideHeader && (
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            Upload Dokumen Persyaratan
          </h3>
        )}
 
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
                      ? "border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/30 shadow-xs"
                      : isDragActive
                      ? "border-emerald-500 dark:border-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/40 scale-[1.02] shadow-md shadow-emerald-500/5"
                      : "border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/50 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50/50"
                  }`}
                >
                  <div>
                    <label className="mb-3 block text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">
                      {requirement.documentName}
                      {requirement.isRequired && <span className="ml-1 text-rose-500 font-extrabold">*</span>}
                      {requirement.templateUrl && (
                        <a href={requirement.templateUrl} download className="ml-2 text-xs font-semibold text-emerald-600 hover:underline">
                          (Unduh Template)
                        </a>
                      )}
                    </label>
 
                    {/* Tampilan File Terpilih */}
                    {uploaded ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2.5 rounded-xl bg-white dark:bg-slate-800/60 border border-emerald-200/60 dark:border-emerald-800/40 p-2.5 sm:p-3 shadow-xs transition-all duration-300">
                          <div className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                            {uploaded.file.type.startsWith("image/") ? (
                              <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                            ) : (
                              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1 overflow-hidden">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[200px] sm:max-w-[320px] leading-tight" title={uploaded.file.name}>
                              {(() => {
                                const fname = uploaded.file.name || "";
                                if (fname.length > 28) {
                                  const ext = fname.includes(".") ? `.${fname.split(".").pop()}` : "";
                                  return `${fname.substring(0, 18)}...${ext}`;
                                }
                                return fname;
                              })()}
                            </p>
                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5 sm:mt-1">
                              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                                {formatSize(uploaded.file.size)}
                              </span>
                              {uploaded.compressedSize && (
                                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-100/40 px-1.5 py-0.5 rounded-md">
                                  Hemat {Math.round(((uploaded.originalSize - uploaded.compressedSize) / uploaded.originalSize) * 100)}%
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5 shrink-0">
                            {uploaded.previewUrl && (
                              <button
                                type="button"
                                onClick={() => setPreviewModal({ url: uploaded.previewUrl!, name: requirement.documentName, type: uploaded.file.type })}
                                className="p-1.5 sm:p-2 text-slate-400 hover:text-[#059669] hover:bg-emerald-50 rounded-lg sm:rounded-xl transition-all"
                                title="Lihat Berkas"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeFile(reqId)}
                              className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg sm:rounded-xl transition-all"
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
                        className={`relative flex flex-col items-center justify-center rounded-xl sm:rounded-2xl border-2 border-dashed p-3.5 sm:p-5 text-center cursor-pointer transition-all duration-300 min-h-[100px] sm:min-h-[135px] ${
                          isDragActive
                            ? "border-emerald-500 dark:border-emerald-400 bg-emerald-50/20 dark:bg-emerald-950/30"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50/40 dark:hover:bg-slate-800/80"
                        }`}
                      >
                        <input
                          id={`file_input_${requirement.id}`}
                          type="file"
                          accept={extensions.split(",").map((ext: string) => `.${ext.trim()}`).join(",")}
                          onChange={(e) => handleFileChange(requirement, e)}
                          className="hidden"
                          disabled={isProcessing}
                        />
                        
                        {isProcessing ? (
                          <div className="space-y-2 w-full animate-in fade-in duration-300">
                            <Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-600 dark:text-emerald-400" />
                            <div className="text-xs font-bold text-slate-700 dark:text-slate-200">Sedang Memproses Berkas...</div>
                            {uploadProgress[reqId] > 0 && (
                              <div className="space-y-1 w-full max-w-[180px] mx-auto">
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
                            <div className="mb-2 sm:mb-2.5 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 shadow-xs border border-slate-100 dark:border-slate-700 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/60 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-all duration-300">
                              <UploadCloud className="h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                              <span className="hidden sm:inline">Seret & lepas berkas, atau </span>
                              <span className="text-emerald-600 dark:text-emerald-400 hover:underline font-extrabold">Pilih / Tap Berkas</span>
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-2.5 sm:mt-3 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-semibold border-t border-slate-100/50 dark:border-slate-800/50 pt-2 shrink-0">
                    <span className="truncate mr-2 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md">Format: {extensions}</span>
                    <span className="shrink-0 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">Batas: {requirement.maxFileSizeMb || 5} MB</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">Item layanan ini tidak memiliki dokumen wajib.</p>
        )}
      </section>

      {/* Preview Modal */}
      {previewModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-6 select-none"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="relative w-[92vw] max-w-7xl h-[88vh] rounded-2xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 py-3.5 bg-slate-50/80 dark:bg-slate-900">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{previewModal.name}</h4>
              <button
                type="button"
                onClick={() => setPreviewModal(null)}
                className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 transition-all font-bold cursor-pointer"
                title="Tutup Preview (X)"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-2 bg-slate-900/90 dark:bg-slate-950 flex items-center justify-center relative">
              {previewModal.type.startsWith("image/") || previewModal.url.match(/\.(jpg|jpeg|png|webp)(\?.*)?$/i) ? (
                <div className="flex items-center justify-center w-full h-full p-2">
                  <img
                    src={previewModal.url}
                    alt={previewModal.name}
                    className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-md"
                  />
                </div>
              ) : (
                <iframe
                  src={previewModal.url}
                  className="w-full h-full min-h-[75vh] border-0 rounded-lg bg-white"
                  title={previewModal.name}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
