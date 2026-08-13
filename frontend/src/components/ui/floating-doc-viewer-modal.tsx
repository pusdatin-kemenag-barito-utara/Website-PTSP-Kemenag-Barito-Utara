import { getClientApiBase } from "@/lib/client-api";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FileText,
  X,
  Download,
  ExternalLink,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Loader2,
} from "lucide-react";

import { lazy, Suspense } from "react";

const PDFJsViewer = lazy(
  () => import("@/components/ui/pdf-js-viewer").then((mod) => ({ default: mod.PDFJsViewer }))
);

interface FloatingDocViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string | null;
  fileName?: string;
}

export function FloatingDocViewerModal({
  isOpen,
  onClose,
  title,
  url,
  fileName,
}: FloatingDocViewerModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isLoading, setIsLoading] = useState(true);

  // Keydown shortcut (Esc) & Body Scroll Lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !url) return null;

  const isImage = url.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i);

  const handleDownload = async () => {
    try {
      const streamUrl = `${getClientApiBase()}/files/proxy?url=${encodeURIComponent(url)}`;
      const res = await fetch(streamUrl);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName || "dokumen.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      a.remove();
    } catch {
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || "dokumen.pdf";
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
        />

        {/* Floating Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={`relative z-10 w-full bg-slate-900 rounded-3xl border border-slate-700/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden transition-all duration-300 ${
            isFullscreen
              ? "h-full max-h-full max-w-full rounded-none"
              : "h-[92vh] max-h-[980px] max-w-7xl"
          }`}
        >
          {/* Header Controls Bar */}
          <div className="px-3 sm:px-5 py-2.5 sm:py-3.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-2 sm:gap-4 shrink-0 select-none">
            {/* Title & Icon */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                <FileText className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h3 className="text-xs sm:text-sm font-black text-slate-100 truncate">
                    {title}
                  </h3>
                  <span className="hidden xs:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[9px] sm:text-[10px] font-bold border border-red-500/20 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                    PDF.js
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                  {fileName || "Dokumen Persyaratan"}
                </p>
              </div>
            </div>

            {/* Actions Toolbar */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Zoom Out */}
              <button
                onClick={() => setZoomLevel((prev) => Math.max(50, prev - 15))}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>

              <button
                onClick={() => setZoomLevel(100)}
                className="text-xs font-bold text-slate-400 hover:text-emerald-400 w-12 text-center hidden sm:inline-block cursor-pointer transition-colors"
                title="Reset Zoom (100%)"
              >
                {zoomLevel}%
              </button>

              {/* Zoom In */}
              <button
                onClick={() => setZoomLevel((prev) => Math.min(200, prev + 15))}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </button>

              <div className="w-px h-4 bg-slate-800 mx-1 hidden sm:block" />

              {/* Download Button */}
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all text-xs font-bold cursor-pointer active:scale-95"
                title="Unduh Berkas"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Unduh</span>
              </button>

              {/* Open in New Tab */}
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all cursor-pointer"
                title="Buka Tab Baru"
              >
                <ExternalLink className="h-4 w-4" />
              </a>

              {/* Fullscreen Toggle */}
              <button
                onClick={() => setIsFullscreen((prev) => !prev)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all cursor-pointer hidden sm:block"
                title={isFullscreen ? "Kecilkan Layar" : "Layar Penuh"}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer ml-1"
                title="Tutup (Esc)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Document Content Viewport */}
          <div className="relative flex-1 bg-slate-950 flex items-center justify-center overflow-auto p-1 sm:p-2">
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 z-20 text-slate-400 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                <p className="text-xs font-bold text-slate-300">
                  Memuat Berkas PDF...
                </p>
              </div>
            )}

            <div
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: "top center",
                transition: "transform 0.15s ease-out",
              }}
              className="w-full h-full flex flex-col items-center justify-center min-h-0"
            >
              {isImage ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={url}
                  alt={title}
                  onLoad={() => setIsLoading(false)}
                  className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-lg border border-slate-800"
                />
              ) : (
                <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-emerald-500" />}>
                  <PDFJsViewer
                    url={url}
                    onLoaded={() => setIsLoading(false)}
                    scale={zoomLevel / 100}
                  />
                </Suspense>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
