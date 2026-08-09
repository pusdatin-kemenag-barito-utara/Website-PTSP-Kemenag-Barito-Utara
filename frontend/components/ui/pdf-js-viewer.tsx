"use client";

import { useEffect, useRef, useState } from "react";
import * as pdfjs from "pdfjs-dist";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

// Set worker source to local public file matching mandau-kemenag pattern (100% offline & CORS-free)
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface PDFJsViewerProps {
  url: string;
  onLoaded?: () => void;
  scale?: number;
}

export function PDFJsViewer({ url, onLoaded, scale = 1.0 }: PDFJsViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjs.PDFDocumentProxy | null>(null);
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
        const streamUrl = `/api/view-document?url=${encodeURIComponent(url)}`;
        const res = await fetch(streamUrl);
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
          if (onLoaded) onLoaded();
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

  // Render ALL pages sequentially onto canvas elements
  useEffect(() => {
    const container = containerRef.current;
    if (!pdfDoc || !container) return;

    let isCancelled = false;
    container.innerHTML = "";

    (async () => {
      for (let pIndex = 1; pIndex <= pdfDoc.numPages; pIndex++) {
        if (isCancelled) break;

        try {
          const page = await pdfDoc.getPage(pIndex);
          if (isCancelled) break;

          const viewport = page.getViewport({ scale });

          // Create container for page
          const pageWrapper = document.createElement("div");
          pageWrapper.className = "relative mb-4 flex flex-col items-center shrink-0 w-full";
          pageWrapper.setAttribute("data-page-num", String(pIndex));

          const canvas = document.createElement("canvas");
          canvas.className = "max-w-full h-auto shadow-xl rounded-lg bg-white border border-slate-700/50";

          const context = canvas.getContext("2d");
          if (!context) continue;

          canvas.height = viewport.height;
          canvas.width = viewport.width;

          pageWrapper.appendChild(canvas);

          // Page indicator badge
          if (pdfDoc.numPages > 1) {
            const pageBadge = document.createElement("span");
            pageBadge.className = "mt-2 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold";
            pageBadge.textContent = `${pIndex} / ${pdfDoc.numPages}`;
            pageWrapper.appendChild(pageBadge);
          }

          container.appendChild(pageWrapper);

          await page.render({
            canvasContext: context,
            viewport: viewport,
            canvas: canvas,
          } as any).promise;
        } catch (e) {
          console.warn(`Render error on page ${pIndex}:`, e);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [pdfDoc, scale]);

  // Track scroll position for active page indicator
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
        }
      }
    });
  };

  if (errorMsg) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400 gap-2">
        <p className="text-sm font-semibold text-red-400">{errorMsg}</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-emerald-400 underline"
        >
          Buka berkas di tab baru
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-0 relative bg-slate-950">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 z-20 text-slate-300 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          <span className="text-xs font-semibold">Memuat Dokumen PDF...</span>
        </div>
      )}

      {/* Floating Page Counter for Multi-page PDFs */}
      {numPages > 1 && !loading && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-700/60 text-xs font-bold text-slate-200 shadow-xl">
          <span>Halaman {currentPage} dari {numPages}</span>
        </div>
      )}

      {/* Scrollable Container for All Pages */}
      <div
        onScroll={handleScroll}
        className="w-full h-full overflow-y-auto overflow-x-hidden p-2 sm:p-4 flex flex-col items-center scroll-smooth"
      >
        <div ref={containerRef} className="w-full max-w-4xl flex flex-col items-center" />
      </div>
    </div>
  );
}
