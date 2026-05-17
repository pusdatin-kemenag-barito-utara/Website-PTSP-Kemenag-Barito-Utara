"use client";

import { X, ExternalLink, FileText, Image as ImageIcon } from "lucide-react";
import { useEffect } from "react";

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
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isImage = fileType?.startsWith("image/") || url.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 sm:p-6 transition-all animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#059669] shadow-sm border border-emerald-100">
              {isImage ? <ImageIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-black text-slate-900 truncate max-w-[200px] sm:max-w-md">
                {title}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Pratinjau Dokumen
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-400 hover:text-rose-500 hover:bg-rose-50 shadow-sm border border-slate-200 transition-all active:scale-90"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-slate-50/30 flex-1 overflow-hidden flex flex-col">
          {isImage ? (
            <div className="p-8 sm:p-12 overflow-auto flex items-center justify-center min-h-[40vh]">
              <div className="relative group">
                <img
                  src={url}
                  alt={title}
                  className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl border-4 border-white"
                />
                <a 
                  href={url} 
                  target="_blank" 
                  className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"
                >
                  <span className="px-4 py-2 bg-white rounded-lg text-xs font-bold shadow-lg">Lihat Ukuran Penuh</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="w-full flex-1 min-h-[70vh]">
              <iframe
                src={`${url}#toolbar=0`}
                className="w-full h-full border-0"
                title={title}
              />
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-center">
          <p className="text-[10px] text-slate-400 font-medium text-center">
            Keamanan Cloudflare R2 aktif • Dokumen ini dienkripsi dan aman
          </p>
        </div>
      </div>
    </div>
  );
}
