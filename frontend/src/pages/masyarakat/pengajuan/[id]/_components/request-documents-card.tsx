import { useState } from "react";
import { FileText, ExternalLink, AlertCircle, Eye, Image as ImageIcon } from "lucide-react";
import { resolveFileViewerUrl } from "@/lib/r2-utils";
import { FloatingDocViewerModal } from "@/components/ui/floating-doc-viewer-modal";

interface RequestDocumentsCardProps {
  documents: any[];
  signedUrlMap: any;
}

function getDocUrl(doc: any, map: any): string | null {
  const rawPath = doc.filePath || doc.file_path || doc.url || "";
  let mappedUrl = null;
  if (map) {
    if (typeof map.get === "function") {
      mappedUrl =
        map.get(doc.id) ||
        map.get(String(doc.id)) ||
        map.get(doc.requirementId) ||
        map.get(String(doc.requirementId));
    } else {
      mappedUrl =
        map[doc.id] ||
        map[String(doc.id)] ||
        map[doc.requirementId] ||
        map[String(doc.requirementId)];
    }
  }
  return mappedUrl || (rawPath ? resolveFileViewerUrl(rawPath) : null);
}

export function RequestDocumentsCard({
  documents,
  signedUrlMap,
}: RequestDocumentsCardProps) {
  const [activeDoc, setActiveDoc] = useState<{
    url: string;
    title: string;
    fileName: string;
    fileType?: string;
  } | null>(null);

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-hidden transition-colors">
      <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="h-8 w-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <FileText className="h-4 w-4" />
          </div>
          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100">
            Dokumen Persyaratan
          </h3>
        </div>
        <span className="text-[11px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
          {documents.length} Dokumen
        </span>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
        {documents.map((doc: any, index: number) => {
          const docUrl = getDocUrl(doc, signedUrlMap);
          const title =
            doc.requirementName ||
            doc.requirement_name ||
            doc.serviceRequirements?.documentName ||
            doc.serviceRequirements?.document_name ||
            doc.fileName ||
            doc.file_name ||
            `Dokumen Persyaratan #${index + 1}`;

          const fname = doc.fileName || doc.file_name || "";
          const fsize = doc.fileSize || doc.file_size || 0;
          const ftype = doc.fileType || doc.file_type || "";
          const isImage = Boolean(
            (ftype && ftype.startsWith("image/")) ||
            (fname && fname.match(/\.(jpg|jpeg|png|webp)$/i))
          );
          const isRequired = doc.isRequired ?? doc.is_required ?? true;

          return (
            <div
              key={doc.id || fname || `${title}-${index}`}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:px-5 sm:py-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
            >
              <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 border border-emerald-100 dark:border-emerald-900/40 mt-0.5 sm:mt-0">
                  {isImage ? <ImageIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100 leading-snug">
                      {title}
                    </p>
                    {isRequired && (
                      <span className="text-[9px] sm:text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.2 rounded border border-rose-200/60 dark:border-rose-900/40">
                        Wajib
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {fname ? (
                      <span
                        className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[200px] sm:max-w-[320px]"
                        title={fname}
                      >
                        {fname}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Belum ada file diunggah</span>
                    )}
                    {fsize > 0 && (
                      <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                        {fsize > 1024 * 1024
                          ? `${(fsize / (1024 * 1024)).toFixed(1)} MB`
                          : `${Math.round(fsize / 1024)} KB`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {docUrl ? (
                <button
                  type="button"
                  onClick={() =>
                    setActiveDoc({
                      url: docUrl,
                      title: title,
                      fileName: fname || "dokumen.pdf",
                      fileType: ftype,
                    })
                  }
                  className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-2 h-10 sm:h-9 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/35 transition-all duration-300 hover:scale-[1.02] active:scale-95 shrink-0 self-stretch sm:self-auto overflow-hidden cursor-pointer"
                  title="Lihat Pratinjau Dokumen"
                >
                  {/* Shimmer animation */}
                  <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out pointer-events-none" />
                  <Eye className="h-3.5 w-3.5" />
                  <span>Lihat Dokumen</span>
                </button>
              ) : (
                <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 w-full sm:w-auto text-center">
                  Belum diunggah
                </span>
              )}
            </div>
          );
        })}

        {!documents.length && (
          <div className="py-10 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
              Belum ada dokumen yang diunggah.
            </p>
          </div>
        )}
      </div>

      {/* Floating Document Viewer Modal */}
      <FloatingDocViewerModal
        isOpen={Boolean(activeDoc)}
        onClose={() => setActiveDoc(null)}
        url={activeDoc?.url}
        title={activeDoc?.title || "Pratinjau Dokumen"}
        fileName={activeDoc?.fileName}
        fileType={activeDoc?.fileType}
      />
    </div>
  );
}
