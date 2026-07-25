"use client";

import { X, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

type PreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
  fileType?: string;
};

export function DocumentPreviewModal({
  isOpen,
  onClose,
  url,
  title,
  fileType,
}: PreviewModalProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !url) {
      setBlobUrl(null);
      setError(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    // Fetch file as Blob to prevent browser navigation / opening new tabs
    fetch(url)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Gagal mengunduh berkas untuk pratinjau");
        }
        const blob = await res.blob();
        if (isMounted) {
          const objectUrl = URL.createObjectURL(blob);
          setBlobUrl(objectUrl);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Preview fetch error:", err);
          setError(err.message || "Gagal memuat dokumen.");
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [isOpen, url]);

  if (!isOpen) return null;

  const isImage = fileType?.startsWith("image/") || title.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/75 backdrop-blur-md p-2 sm:p-4 md:p-6 transition-all animate-in fade-in duration-300">
      <div className="relative w-full max-w-6xl lg:max-w-7xl flex flex-col bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 h-[92vh] max-h-[94vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#059669] dark:text-emerald-400 shadow-xs border border-emerald-100 dark:border-emerald-900/40 shrink-0">
              {isImage ? <ImageIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
            </div>
            <div className="flex flex-col min-w-0">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate max-w-[240px] sm:max-w-xl">
                {title}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Pratinjau Dokumen PDF
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 shadow-xs border border-slate-200 dark:border-slate-700 transition-all active:scale-90 cursor-pointer shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Area (Viewer) */}
        <div className="bg-slate-100 dark:bg-slate-950 flex-1 overflow-auto touch-auto flex flex-col justify-center items-center relative w-full h-full">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center space-y-3 p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Memuat Pratinjau Dokumen...
              </p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-rose-500 font-semibold text-xs">
              {error}
            </div>
          ) : isImage && blobUrl ? (
            <div className="p-4 sm:p-6 overflow-auto flex items-center justify-center w-full h-full">
              <img
                src={blobUrl}
                alt={title}
                className="max-w-full max-h-full object-contain rounded-xl shadow-xl border-2 border-white dark:border-slate-800"
              />
            </div>
          ) : blobUrl ? (
            <div className="w-full h-full flex-1 overflow-auto touch-auto">
              <iframe
                src={`${blobUrl}#toolbar=1&navpanes=0`}
                className="w-full h-full border-0 min-h-[70vh] sm:min-h-full"
                title={title}
              />
            </div>
          ) : null}
        </div>

        {/* Footer info */}
        <div className="px-6 py-2.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-center shrink-0">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium text-center">
            Keamanan Cloudflare R2 aktif • Dokumen ini dienkripsi dan aman
          </p>
        </div>
      </div>
    </div>
  );
}
