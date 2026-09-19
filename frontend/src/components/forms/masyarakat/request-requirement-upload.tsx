import { useState, useEffect, useRef } from "react";
import { Eye, X, FileText, Image as ImageIcon, Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { compressImageToUnder } from "@/lib/image-compression";
import { FloatingDocViewerModal } from "@/components/ui/floating-doc-viewer-modal";

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
  const [previewModal, setPreviewModal] = useState<{
    url: string;
    name: string;
    type: string;
    fileName?: string;
  } | null>(null);

  const intervalRefs = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    return () => {
      Object.values(intervalRefs.current).forEach(clearInterval);
    };
  }, []);

  // Hanya reset uploaded files jika ID persyaratan benar-benar berganti (misal ganti layanan)
  const reqKey = (requirements || []).map((r: any) => String(r.id)).sort().join(",");
  const prevReqKey = useRef(reqKey);
  useEffect(() => {
    if (prevReqKey.current !== reqKey) {
      Object.values(uploadedFiles).forEach((uploaded) => {
        if (uploaded.previewUrl) {
          URL.revokeObjectURL(uploaded.previewUrl);
        }
      });
      setUploadedFiles({});
      prevReqKey.current = reqKey;
    }
  }, [reqKey]);

  const processFile = async (requirement: any, file: File) => {
    const reqId = String(requirement.id);
    const docName =
      requirement.name ||
      requirement.documentName ||
      requirement.document_name ||
      "Dokumen Persyaratan";
    const originalSize = file.size;

    // Normalisasi Ekstensi yang diizinkan
    const rawExtensions =
      requirement.allowedExtensions ||
      requirement.allowed_extensions ||
      "pdf,jpg,jpeg,png";
    const allowedList = rawExtensions
      .split(",")
      .map((ext: string) => ext.trim().toLowerCase().replace(/^\./, ""));

    if (allowedList.includes("jpg") && !allowedList.includes("jpeg")) allowedList.push("jpeg");
    if (allowedList.includes("jpeg") && !allowedList.includes("jpg")) allowedList.push("jpg");

    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";

    if (!allowedList.includes(fileExtension)) {
      toast.error(`Format File Salah!`, {
        description: `Format yang diizinkan untuk ${docName}: ${allowedList.join(", ")}.`,
        duration: 3500,
      });
      return;
    }

    setProcessingFiles((prev) => ({ ...prev, [reqId]: true }));
    setUploadProgress((prev) => ({ ...prev, [reqId]: 25 }));

    try {
      let progress = 25;
      intervalRefs.current[reqId] = setInterval(() => {
        progress = Math.min(progress + 20, 85);
        setUploadProgress((prev) => ({ ...prev, [reqId]: progress }));
      }, 80);

      let fileToUpload = file;
      let isCompressed = false;

      // Kompresi jika file adalah Gambar dan ukuran > 800 KB
      const isImg = file.type?.startsWith("image/") || ["jpg", "jpeg", "png", "webp"].includes(fileExtension);
      if (isImg && file.size > 800 * 1024) {
        try {
          fileToUpload = await compressImageToUnder(file, 800);
          if (fileToUpload.size < file.size) {
            isCompressed = true;
          }
        } catch (e) {
          console.warn("Kompresi dilewati, menggunakan file asli.", e);
        }
      }

      if (intervalRefs.current[reqId]) {
        clearInterval(intervalRefs.current[reqId]);
        delete intervalRefs.current[reqId];
      }
      setUploadProgress((prev) => ({ ...prev, [reqId]: 95 }));

      // Validasi Ukuran Maksimal
      const maxSizeMb =
        Number(requirement.maxFileSizeMb) ||
        Number(requirement.max_file_size_mb) ||
        5;
      const maxSizeBytes = maxSizeMb * 1024 * 1024;
      if (fileToUpload.size > maxSizeBytes) {
        toast.error(`File Terlalu Besar!`, {
          description: `Batas maksimal berkas ini adalah ${maxSizeMb} MB.`,
          duration: 3500,
        });
        setUploadProgress((prev) => ({ ...prev, [reqId]: 0 }));
        return;
      }

      // Buat URL pratinjau
      let previewUrl: string | undefined;
      const mimeType = fileToUpload.type || (fileExtension === "pdf" ? "application/pdf" : `image/${fileExtension}`);
      if (mimeType.startsWith("image/") || mimeType === "application/pdf") {
        previewUrl = URL.createObjectURL(fileToUpload);
      }

      // Simpan ke state
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

      setUploadProgress((prev) => ({ ...prev, [reqId]: 100 }));
      setTimeout(() => {
        setUploadProgress((prev) => ({ ...prev, [reqId]: 0 }));
      }, 300);

      if (isCompressed) {
        toast.success(`Dokumen Berhasil Dipilih & Dioptimasi!`, {
          description: `${docName}: ${(originalSize / 1024).toFixed(0)}KB → ${(fileToUpload.size / 1024).toFixed(0)}KB`,
        });
      } else {
        toast.success(`${docName} berhasil dilampirkan!`);
      }
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Gagal memproses file.");
      setUploadProgress((prev) => ({ ...prev, [reqId]: 0 }));
    } finally {
      setProcessingFiles((prev) => ({ ...prev, [reqId]: false }));
    }
  };

  const handleFileChange = async (requirement: any, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(requirement, file);
    e.target.value = "";
  };

  const handleDrag = (reqId: string, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive((prev) => ({ ...prev, [reqId]: true }));
    } else if (e.type === "dragleave") {
      setDragActive((prev) => ({ ...prev, [reqId]: false }));
    }
  };

  const handleDrop = async (requirement: any, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const reqId = String(requirement.id);
    setDragActive((prev) => ({ ...prev, [reqId]: false }));

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
      <section
        className={
          hideHeader
            ? "w-full min-w-0 overflow-hidden"
            : "rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 sm:p-6 shadow-2xs transition-colors duration-300 w-full min-w-0 overflow-hidden"
        }
      >
        {!hideHeader && (
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            Upload Dokumen Persyaratan
          </h3>
        )}

        {requirements.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-5 w-full min-w-0">
            {requirements.map((requirement: any) => {
              const reqId = String(requirement.id);
              const uploaded = uploadedFiles[reqId];
              const isProcessing = processingFiles[reqId];
              const isDrag = dragActive[reqId];
              const rawExtensions =
                requirement.allowedExtensions ||
                requirement.allowed_extensions ||
                "pdf,jpg,jpeg,png";
              const isRequired =
                requirement.isRequired ?? requirement.is_required ?? false;
              const docName =
                requirement.name ||
                requirement.documentName ||
                requirement.document_name ||
                "Dokumen Persyaratan";
              const maxSizeMb =
                Number(requirement.maxFileSizeMb) ||
                Number(requirement.max_file_size_mb) ||
                5;

              return (
                <div
                  key={requirement.id}
                  className={`group rounded-xl sm:rounded-2xl border-2 transition-all duration-300 p-3 sm:p-4.5 flex flex-col justify-between w-full min-w-0 overflow-hidden ${
                    uploaded
                      ? "border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/20 dark:bg-emerald-950/30 shadow-xs"
                      : isDrag
                      ? "border-emerald-500 dark:border-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/40 scale-[1.01] shadow-md shadow-emerald-500/5"
                      : "border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="w-full min-w-0 overflow-hidden">
                    <div className="mb-2.5 flex items-start justify-between gap-2 w-full min-w-0">
                      <label className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 leading-snug truncate">
                        {docName}
                        {isRequired && (
                          <span className="ml-1 text-rose-500 font-extrabold" title="Wajib diunggah">
                            *
                          </span>
                        )}
                      </label>
                      {requirement.templateUrl && (
                        <a
                          href={requirement.templateUrl}
                          download
                          className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline shrink-0"
                        >
                          Unduh Template
                        </a>
                      )}
                    </div>

                    {/* Tampilan File Terpilih */}
                    {uploaded ? (
                      <div className="w-full min-w-0 space-y-2">
                        <div className="flex items-center gap-2 rounded-xl bg-white dark:bg-slate-800/80 border border-emerald-200/80 dark:border-emerald-800/60 p-2.5 sm:p-3 shadow-xs transition-all w-full min-w-0 overflow-hidden">
                          <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100/70 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
                            {uploaded.file.type.startsWith("image/") ? (
                              <ImageIcon className="h-4.5 w-4.5" />
                            ) : (
                              <FileText className="h-4.5 w-4.5" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1 overflow-hidden">
                            <p
                              className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate block w-full leading-tight"
                              title={uploaded.file.name}
                            >
                              {uploaded.file.name}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1 overflow-hidden">
                              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md shrink-0">
                                {formatSize(uploaded.file.size)}
                              </span>
                              {uploaded.compressedSize && (
                                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.5 rounded-md truncate">
                                  Hemat {Math.round(((uploaded.originalSize - uploaded.compressedSize) / uploaded.originalSize) * 100)}%
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 ml-1">
                            {uploaded.previewUrl && (
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewModal({
                                    url: uploaded.previewUrl!,
                                    name: docName,
                                    type: uploaded.file.type,
                                    fileName: uploaded.file.name,
                                  })
                                }
                                className="h-8 w-8 flex items-center justify-center text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 rounded-lg transition-all cursor-pointer shrink-0"
                                title="Lihat Pratinjau Berkas"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeFile(reqId)}
                              className="h-8 w-8 flex items-center justify-center text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 rounded-lg transition-all cursor-pointer shrink-0"
                              title="Hapus dan ganti berkas"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Drag & Drop Area Native Label */
                      <label
                        htmlFor={`file_input_${reqId}`}
                        onDragEnter={(e) => handleDrag(reqId, e)}
                        onDragOver={(e) => handleDrag(reqId, e)}
                        onDragLeave={(e) => handleDrag(reqId, e)}
                        onDrop={(e) => handleDrop(requirement, e)}
                        className={`relative flex flex-col items-center justify-center rounded-xl sm:rounded-2xl border-2 border-dashed p-4 sm:p-5 text-center cursor-pointer transition-all duration-300 min-h-[105px] sm:min-h-[120px] select-none w-full min-w-0 overflow-hidden ${
                          isDrag
                            ? "border-emerald-500 dark:border-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/40"
                            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:border-emerald-400 dark:hover:border-emerald-600 hover:bg-emerald-50/10 dark:hover:bg-slate-800"
                        }`}
                      >
                        <input
                          id={`file_input_${reqId}`}
                          type="file"
                          accept={rawExtensions
                            .split(",")
                            .map((ext: string) => `.${ext.trim().toLowerCase().replace(/^\./, "")}`)
                            .join(",")}
                          onChange={(e) => handleFileChange(requirement, e)}
                          className="sr-only"
                          disabled={isProcessing}
                        />

                        {isProcessing ? (
                          <div className="space-y-2 w-full animate-in fade-in duration-300">
                            <Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-600 dark:text-emerald-400" />
                            <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                              Sedang Memproses Berkas...
                            </div>
                            {uploadProgress[reqId] > 0 && (
                              <div className="space-y-1 w-full max-w-[180px] mx-auto">
                                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-emerald-500 rounded-full transition-all duration-200"
                                    style={{ width: `${uploadProgress[reqId]}%` }}
                                  />
                                </div>
                                <div className="text-[10px] font-black text-slate-400">
                                  {uploadProgress[reqId]}% SELESAI
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="group-hover:scale-[1.02] transition-transform duration-200 flex flex-col items-center pointer-events-none">
                            <div className="mb-1.5 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-400 shadow-2xs group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/60 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              <UploadCloud className="h-4.5 w-4.5" />
                            </div>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                              <span className="hidden sm:inline">Seret & lepas berkas, atau </span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold underline-offset-2 hover:underline">
                                Pilih / Tap Berkas
                              </span>
                            </p>
                          </div>
                        )}
                      </label>
                    )}
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-semibold border-t border-slate-100 dark:border-slate-800 pt-2 shrink-0 w-full min-w-0 gap-2">
                    <span className="truncate uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md font-mono text-[9px] sm:text-[10px] min-w-0">
                      Format: {rawExtensions}
                    </span>
                    <span className="shrink-0 font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] whitespace-nowrap">
                      Batas: {maxSizeMb} MB
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Item layanan ini tidak memiliki dokumen persyaratan wajib.
          </p>
        )}
      </section>

      {/* Floating Document Viewer Modal (Identik dengan Panel Admin & Arsip) */}
      <FloatingDocViewerModal
        isOpen={Boolean(previewModal)}
        onClose={() => setPreviewModal(null)}
        url={previewModal?.url}
        title={previewModal?.name || "Pratinjau Dokumen Persyaratan"}
        fileName={previewModal?.fileName}
        fileType={previewModal?.type}
      />
    </>
  );
}
