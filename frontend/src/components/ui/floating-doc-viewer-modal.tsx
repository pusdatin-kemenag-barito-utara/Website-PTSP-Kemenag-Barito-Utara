import { useEffect, useState, useRef, useCallback } from "react";
import {
  X,
  ExternalLink,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FileText,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import { resolveFileViewerUrl } from "@/lib/r2-utils";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/scroll-lock";

export interface FloatingDocViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string | null | undefined;
  title?: string;
  fileName?: string;
  fileType?: string;
}

/**
 * Individual Page Item for Continuous Vertical Scrolling.
 * Uses IntersectionObserver to lazily render pages as the user scrolls down.
 */
function PdfPageItem({
  pdfDoc,
  pageNumber,
  scale,
  rotation,
  onInView,
}: {
  pdfDoc: any;
  pageNumber: number;
  scale: number;
  rotation: number;
  onInView: (page: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rendered, setRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(pageNumber <= 2);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 320,
    height: 450,
  });
  const renderTaskRef = useRef<any>(null);

  // Observe when this page comes into view during scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
            onInView(pageNumber);
          }
        }
      },
      { rootMargin: "400px 0px" } // Preload 400px before scrolling into viewport
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [pageNumber, onInView]);

  // Render page onto canvas
  useEffect(() => {
    if (!pdfDoc || !isVisible) return;
    let active = true;

    (async () => {
      try {
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch {}
        }

        const page = await pdfDoc.getPage(pageNumber);
        if (!active) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const containerWidth =
          canvas.parentElement?.parentElement?.clientWidth || window.innerWidth;
        const unscaledViewport = page.getViewport({ scale: 1, rotation });

        // Cap width at 900px for comfortable reading
        const targetWidth = Math.min(containerWidth - 32, 900);
        const fitScale = Math.max(0.4, targetWidth / unscaledViewport.width);
        const effectiveScale = fitScale * scale;

        const viewport = page.getViewport({ scale: effectiveScale, rotation });
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = Math.floor(viewport.width * pixelRatio);
        canvas.height = Math.floor(viewport.height * pixelRatio);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        setDimensions({
          width: Math.floor(viewport.width),
          height: Math.floor(viewport.height),
        });

        const transform =
          pixelRatio !== 1 ? [pixelRatio, 0, 0, pixelRatio, 0, 0] : undefined;

        const renderTask = page.render({
          canvasContext: ctx,
          viewport,
          transform,
        });
        renderTaskRef.current = renderTask;
        await renderTask.promise;
        if (active) setRendered(true);
      } catch (err: any) {
        if (err?.name !== "RenderingCancelledException") {
          console.error(`[PDF.js] Error rendering page ${pageNumber}:`, err);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [pdfDoc, pageNumber, scale, rotation, isVisible]);

  return (
    <div
      id={`pdf-page-${pageNumber}`}
      ref={containerRef}
      className="relative my-3 mx-auto bg-white shadow-2xl rounded-lg overflow-hidden flex items-center justify-center transition-all shrink-0 border border-slate-700/40"
      style={{
        minHeight: dimensions.height,
        width: dimensions.width,
        touchAction: "pan-y",
      }}
    >
      <canvas
        ref={canvasRef}
        className="block max-w-full"
        style={{ touchAction: "pan-y" }}
      />
      {!rendered && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 text-slate-300 text-xs font-semibold">
          <Loader2 className="w-5 h-5 animate-spin mr-2 text-emerald-500" />
          <span>Memuat Halaman {pageNumber}...</span>
        </div>
      )}
      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/75 text-white text-[10px] font-mono pointer-events-none select-none backdrop-blur-xs">
        {pageNumber}
      </div>
    </div>
  );
}

export function FloatingDocViewerModal({
  isOpen,
  onClose,
  url,
  title = "Pratinjau Dokumen",
  fileName,
  fileType,
}: FloatingDocViewerModalProps) {
  const [viewMode, setViewMode] = useState<"iframe" | "canvas">("iframe");
  const [loading, setLoading] = useState(true);

  // Canvas (PDF.js) multi-page continuous scroll states
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [activePage, setActivePage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [canvasLoading, setCanvasLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Normalize URL to official files.kemenag-baritoutara.com domain
  const viewerUrl = resolveFileViewerUrl(url);
  const isImage = Boolean(
    (fileType && fileType.startsWith("image/")) ||
    (fileName && fileName.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i)) ||
    (viewerUrl && viewerUrl.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i))
  );
  const effectiveFileName = fileName || viewerUrl.split("/").pop()?.split("?")[0] || "dokumen.pdf";

  // Device detection & initial setup (matching PPID project behavior)
  useEffect(() => {
    if (!isOpen) return;

    let shouldUseCanvas = false;
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent || "";
      const isAppleMac =
        /Macintosh|Mac OS X|MacBook/i.test(ua) ||
        (navigator.platform && navigator.platform.toUpperCase().indexOf("MAC") >= 0);
      const isMobile =
        window.innerWidth < 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

      shouldUseCanvas = isAppleMac || isMobile;
    }

    if (shouldUseCanvas) {
      setViewMode("canvas");
    } else {
      setViewMode("iframe");
    }

    setLoading(true);
    setActivePage(1);
    setScale(1.0);
    setRotation(0);
  }, [isOpen, viewerUrl]);

  // Body scroll lock & ESC shortcut
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") setScale((s) => Math.min(2.5, Number((s + 0.2).toFixed(1))));
      if (e.key === "-") setScale((s) => Math.max(0.5, Number((s - 0.2).toFixed(1))));
      if (e.key.toLowerCase() === "r") setRotation((r) => (r + 90) % 360);
    };

    lockBodyScroll();
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      unlockBodyScroll();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Load document via PDF.js when viewMode is 'canvas'
  useEffect(() => {
    if (!isOpen || !viewerUrl || viewMode !== "canvas" || isImage) return;
    let active = true;
    setCanvasLoading(true);

    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        try {
          pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        } catch {
          pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
        }

        const loadingTask = pdfjs.getDocument({
          url: viewerUrl,
          cMapPacked: true,
        });

        const loadedDoc = await loadingTask.promise;
        if (!active) return;
        setPdfDoc(loadedDoc);
        setNumPages(loadedDoc.numPages);
        setActivePage(1);
      } catch (err) {
        console.warn("[Viewer] Gagal memuat via PDF.js canvas, beralih ke native iframe:", err);
        if (active) {
          setViewMode("iframe");
        }
      } finally {
        if (active) setCanvasLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [isOpen, viewerUrl, viewMode, isImage]);

  const handlePageInView = useCallback((page: number) => {
    setActivePage(page);
  }, []);

  const scrollToPage = (page: number) => {
    const target = Math.max(1, Math.min(numPages, page));
    const el = document.getElementById(`pdf-page-${target}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleDownload = async () => {
    if (!viewerUrl) return;
    try {
      if (viewerUrl.startsWith("blob:")) {
        const a = document.createElement("a");
        a.href = viewerUrl;
        a.download = effectiveFileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        return;
      }
      const res = await fetch(viewerUrl);
      if (!res.ok) throw new Error("Fetch failed");
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = effectiveFileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      a.remove();
    } catch {
      window.open(viewerUrl, "_blank");
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-xs flex items-center justify-center p-0 md:p-4 animate-in fade-in duration-150 overscroll-none select-none"
      style={{
        overscrollBehavior: "none",
        touchAction: "none",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      onTouchMove={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
        }
      }}
    >
      {/* Modal Container: Fullscreen on mobile, rounded framed on desktop */}
      <div
        className="bg-slate-900 border-0 md:border md:border-slate-800 rounded-none md:rounded-2xl w-full h-full md:w-[95vw] md:max-w-[1400px] md:h-[93vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 overscroll-contain"
        style={{
          overscrollBehavior: "contain",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header - PPID Style */}
        <div
          className="flex items-center justify-between px-3 md:px-6 py-2.5 md:py-3 border-b border-slate-800 bg-slate-950 select-none shrink-0 gap-2"
          style={{ touchAction: "none" }}
        >
          <div className="flex items-center gap-2.5 min-w-0 max-w-[55%] sm:max-w-[65%] md:max-w-[70%]">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              {isImage ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
            </div>
            <div className="min-w-0">
              <h2 className="text-xs md:text-sm font-bold text-slate-100 tracking-tight truncate">
                {title}
              </h2>
              <p className="text-[10px] md:text-[11px] text-slate-400 truncate flex items-center gap-1.5">
                <span>{effectiveFileName}</span>
                <span className="hidden sm:inline-block text-emerald-400 font-medium">
                  {viewerUrl?.startsWith("blob:") ? "• Berkas Lokal" : "• files.kemenag-baritoutara.com"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Mode Switcher (only for PDFs) */}
            {!isImage && viewerUrl && (
              <button
                type="button"
                onClick={() => setViewMode(viewMode === "iframe" ? "canvas" : "iframe")}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-[11px] sm:text-xs font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer"
                title={
                  viewMode === "iframe"
                    ? "Ganti ke mode lembar dokumen (Canvas)"
                    : "Ganti ke mode penampil standar (Native)"
                }
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">
                  {viewMode === "iframe" ? "Mode Lembar" : "Mode Standar"}
                </span>
              </button>
            )}

            {/* Buka di Tab Baru (Cloudflare Worker Domain) */}
            {viewerUrl && (
              <a
                href={viewerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-[11px] sm:text-xs font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer"
                title="Buka dokumen di tab baru"
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Buka Tab Baru</span>
              </a>
            )}

            {/* Download Button */}
            {viewerUrl && (
              <button
                type="button"
                onClick={handleDownload}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-[11px] sm:text-xs font-bold transition-colors cursor-pointer shadow-xs"
                title="Unduh berkas dokumen"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh</span>
              </button>
            )}

            {/* Tombol Tutup X Merah (PPID Style) */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white transition-colors cursor-pointer shadow-xs ml-0.5"
              title="Tutup (Esc)"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Floating Canvas / Image Control Toolbar (PPID Style) */}
        {viewerUrl && ((!isImage && viewMode === "canvas") || isImage) && (
          <div
            className="flex items-center justify-between px-3 py-2 bg-slate-950 text-white border-b border-slate-800 select-none shrink-0 text-xs gap-2"
            style={{ touchAction: "none" }}
          >
            {/* Pagination Controls with Smooth Scroll (PDF) or Image badge */}
            {!isImage ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => scrollToPage(activePage - 1)}
                  disabled={activePage <= 1 || canvasLoading}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-200 transition-colors cursor-pointer"
                  title="Gulir ke Halaman Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-semibold text-slate-300 text-[11px] whitespace-nowrap">
                  {canvasLoading ? "Memuat..." : `Hal ${activePage} / ${numPages || 1}`}
                </span>
                <button
                  type="button"
                  onClick={() => scrollToPage(activePage + 1)}
                  disabled={activePage >= numPages || canvasLoading}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-200 transition-colors cursor-pointer"
                  title="Gulir ke Halaman Selanjutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium px-1">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Pratinjau Gambar</span>
              </div>
            )}

            {/* Zoom & Rotation Controls */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setScale((s) => Math.max(0.5, Number((s - 0.2).toFixed(1))))}
                disabled={scale <= 0.5 || canvasLoading}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-200 transition-colors cursor-pointer"
                title="Perkecil (-)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono text-slate-400 min-w-[36px] text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setScale((s) => Math.min(2.5, Number((s + 0.2).toFixed(1))))}
                disabled={scale >= 2.5 || canvasLoading}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-200 transition-colors cursor-pointer"
                title="Perbesar (+)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                disabled={canvasLoading}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                title={`Putar Dokumen (${rotation}°)`}
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Viewer Body */}
        <div className="flex-1 bg-slate-950 relative w-full h-full overflow-hidden flex flex-col">
          {!viewerUrl ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3 p-6 text-center">
              <AlertCircle className="w-10 h-10 text-rose-500" />
              <p className="text-sm font-bold text-slate-200">
                Berkas Dokumen Tidak Ditemukan
              </p>
              <p className="text-xs text-slate-400 max-w-md">
                Tautan dokumen kosong atau belum berhasil diunggah ke penyimpanan Cloudflare.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
              >
                Kembali
              </button>
            </div>
          ) : isImage ? (
            <div
              className="w-full h-full flex items-center justify-center p-4 overflow-auto bg-slate-950 overscroll-contain"
              style={{
                WebkitOverflowScrolling: "touch",
                overscrollBehavior: "contain",
                touchAction: "pan-x pan-y pinch-zoom",
              }}
            >
              <img
                src={viewerUrl}
                alt={title}
                style={{
                  transform: `rotate(${rotation}deg) scale(${scale})`,
                  transition: "transform 0.15s ease-out",
                  touchAction: "pan-x pan-y pinch-zoom",
                }}
                className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-slate-800 select-none"
              />
            </div>
          ) : viewMode === "iframe" ? (
            <>
              {loading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950 text-white gap-3">
                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                  <span className="text-xs font-semibold text-slate-300">
                    Menyiapkan pratinjau dokumen PDF...
                  </span>
                </div>
              )}
              <iframe
                src={`${viewerUrl}#toolbar=1&navpanes=1&view=FitH`}
                onLoad={() => setLoading(false)}
                className="w-full h-full border-0 flex-1 bg-slate-900"
                title={effectiveFileName}
              />
            </>
          ) : (
            <div
              ref={scrollContainerRef}
              className="w-full flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-4 bg-slate-950 flex flex-col items-center scroll-smooth overscroll-contain"
              style={{
                WebkitOverflowScrolling: "touch",
                overscrollBehavior: "contain",
                overscrollBehaviorY: "contain",
                touchAction: "pan-y",
              }}
            >
              {canvasLoading ? (
                <div className="flex flex-col items-center justify-center text-white gap-3 py-20">
                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                  <span className="text-xs font-semibold text-slate-300">
                    Memuat lembar dokumen PDF...
                  </span>
                </div>
              ) : numPages > 0 ? (
                <div className="w-full flex flex-col items-center py-2 touch-pan-y" style={{ touchAction: "pan-y" }}>
                  {Array.from({ length: numPages }, (_, index) => (
                    <PdfPageItem
                      key={`page-${index + 1}`}
                      pdfDoc={pdfDoc}
                      pageNumber={index + 1}
                      scale={scale}
                      rotation={rotation}
                      onInView={handlePageInView}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Modal Footer - PPID Style */}
        <div
          className="px-4 md:px-6 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0 select-none"
          style={{ touchAction: "none" }}
        >
          <p className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">
            Dokumen resmi PTSP Kemenag Barito Utara • files.kemenag-baritoutara.com
          </p>

          {/* Tombol Tutup Merah (PPID Style) */}
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

export default FloatingDocViewerModal;
