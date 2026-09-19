import { getClientApiBase } from "@/lib/client-api";
import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { Loader2 } from "lucide-react";

interface PDFJsViewerProps {
  url: string;
  onLoaded?: (info?: { numPages: number }) => void;
  scale?: number;
  rotation?: number;
  onPageChange?: (currentPage: number, totalPages: number) => void;
}

export function PDFJsViewer({
  url,
  onLoaded,
  scale = 1.0,
  rotation = 0,
  onPageChange,
}: PDFJsViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollWrapperRef = useRef<HTMLDivElement | null>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load PDF Document
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setErrorMsg(null);

    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        let res: Response;
        if (
          url.startsWith("https://files.kemenag-baritoutara.com/") ||
          url.startsWith("blob:") ||
          url.startsWith("data:")
        ) {
          try {
            res = await fetch(url);
            if (!res.ok) throw new Error(`Direct fetch HTTP ${res.status}`);
          } catch {
            const streamUrl = `${getClientApiBase()}/files/proxy?url=${encodeURIComponent(url)}`;
            res = await fetch(streamUrl);
          }
        } else {
          const streamUrl = `${getClientApiBase()}/files/proxy?url=${encodeURIComponent(url)}`;
          res = await fetch(streamUrl);
        }

        if (isCancelled) return;
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const arrayBuffer = await res.arrayBuffer();
        if (isCancelled) return;
        if (arrayBuffer.byteLength === 0) throw new Error("File 0 byte");

        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const doc = await loadingTask.promise;

        if (!isCancelled) {
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          setCurrentPage(1);
          setLoading(false);
          if (onLoaded) onLoaded({ numPages: doc.numPages });
          if (onPageChange) onPageChange(1, doc.numPages);
        }
      } catch (err) {
        console.error("[PDF.js] Load error:", err);
        if (!isCancelled) {
          setErrorMsg("Gagal memuat halaman PDF.");
          setLoading(false);
          if (onLoaded) onLoaded();
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [url, onLoaded]);

  // Render ALL pages sequentially onto canvas elements with auto-fit width, crisp HiDPI & rotation
  useEffect(() => {
    const container = containerRef.current;
    const scrollWrapper = scrollWrapperRef.current;
    if (!pdfDoc || !container) return;

    let isCancelled = false;
    container.innerHTML = "";

    (async () => {
      // Determine optimal fit-to-width scale based on container
      const availableWidth = scrollWrapper ? Math.min(scrollWrapper.clientWidth - 48, 1000) : 860;

      for (let pIndex = 1; pIndex <= pdfDoc.numPages; pIndex++) {
        if (isCancelled) break;

        try {
          const page = await pdfDoc.getPage(pIndex);
          if (isCancelled) break;

          const totalRotation = (page.rotate + (rotation || 0)) % 360;
          const unscaledViewport = page.getViewport({ scale: 1.0, rotation: totalRotation });

          // Calculate auto-fit multiplier so A4 portrait/landscape comfortably fills width
          const fitMultiplier = availableWidth > 320 && unscaledViewport.width > 0
            ? (availableWidth / unscaledViewport.width)
            : 1.35;
          const effectiveScale = fitMultiplier * scale;

          const viewport = page.getViewport({ scale: effectiveScale, rotation: totalRotation });

          // Create page wrapper
          const pageWrapper = document.createElement("div");
          pageWrapper.className =
            "relative my-4 flex flex-col items-center shrink-0 max-w-full transition-transform duration-200 touch-pan-y";
          pageWrapper.setAttribute("data-page-num", String(pIndex));
          pageWrapper.id = `pdf-page-${pIndex}`;
          pageWrapper.style.touchAction = "pan-y";

          const canvas = document.createElement("canvas");
          canvas.className =
            "max-w-full h-auto shadow-2xl rounded-sm bg-white border border-slate-700/60 touch-pan-y";
          canvas.style.touchAction = "pan-y";

          const context = canvas.getContext("2d");
          if (!context) continue;

          // HiDPI crisp rendering
          const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
          canvas.width = Math.floor(viewport.width * dpr);
          canvas.height = Math.floor(viewport.height * dpr);
          canvas.style.width = `${Math.floor(viewport.width)}px`;
          canvas.style.height = `${Math.floor(viewport.height)}px`;

          const transform = dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null;

          pageWrapper.appendChild(canvas);
          container.appendChild(pageWrapper);

          await page.render({
            canvasContext: context,
            transform: transform as any,
            viewport: viewport,
          } as any).promise;
        } catch (e) {
          console.warn(`Render error on page ${pIndex}:`, e);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [pdfDoc, scale, rotation]);

  // Track scroll position for active page indicator in header toolbar
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const pageNodes = container.querySelectorAll("[data-page-num]");
    const containerTop = container.scrollTop;

    pageNodes.forEach((node) => {
      const el = node as HTMLElement;
      const top = el.offsetTop - container.offsetTop;
      const height = el.offsetHeight;
      if (containerTop >= top - height / 3 && containerTop < top + height) {
        const pNum = Number(el.getAttribute("data-page-num"));
        if (pNum && pNum !== currentPage) {
          setCurrentPage(pNum);
          if (onPageChange && numPages > 0) {
            onPageChange(pNum, numPages);
          }
        }
      }
    });
  };

  if (errorMsg) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 gap-3">
        <p className="text-sm font-semibold text-rose-400">{errorMsg}</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline"
        >
          Buka berkas di tab baru
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full h-full min-h-0 relative bg-slate-950 overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 z-20 text-slate-300 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          <span className="text-xs font-bold">Memuat Dokumen PDF...</span>
        </div>
      )}

      {/* Scrollable Container for All Pages with smooth vertical scroll */}
      <div
        ref={scrollWrapperRef}
        onScroll={handleScroll}
        className="w-full h-full overflow-y-auto overflow-x-hidden p-3 sm:p-6 md:p-8 flex flex-col items-center scroll-smooth overscroll-contain"
        style={{
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain",
          overscrollBehaviorY: "contain",
          touchAction: "pan-y",
        }}
      >
        <div
          ref={containerRef}
          className="flex flex-col items-center max-w-full touch-pan-y"
          style={{ touchAction: "pan-y" }}
        />
      </div>
    </div>
  );
}
