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
        <div className="p-8 sm:p-12 flex flex-col items-center justify-center bg-slate-50/30">
          {isImage ? (
            <div className="relative group">
              <img
                src={url}
                alt={title}
                className="max-w-full max-h-[60vh] object-contain rounded-2xl shadow-2xl border-4 border-white"
              />
              <a 
                href={url} 
                target="_blank" 
                className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"
              >
                <span className="px-4 py-2 bg-white rounded-lg text-xs font-bold shadow-lg">Lihat Ukuran Penuh</span>
              </a>
            </div>
          ) : (
            <div className="text-center max-w-md">
              <div className="mx-auto h-24 w-24 bg-emerald-50 rounded-3xl flex items-center justify-center mb-6 shadow-inner border border-emerald-100/50">
                <FileText className="h-10 w-10 text-emerald-600 animate-pulse" />
              </div>
              <h4 className="text-lg font-black text-slate-800 mb-2">Dokumen Siap Dibuka</h4>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                Demi keamanan, beberapa dokumen (PDF) hanya bisa dibuka di jendela baru. Silakan klik tombol di bawah untuk melihat dokumen.
              </p>
              
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all active:scale-95"
              >
                <ExternalLink className="h-5 w-5" />
                Buka Dokumen Sekarang
              </a>
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
