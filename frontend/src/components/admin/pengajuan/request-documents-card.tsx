import { useState } from "react";
import { Card } from "@/components/ui/card";
import { FileCheck, FileText, AlertCircle, Eye, Clock, CheckCircle2 } from "lucide-react";
import { FloatingDocViewerModal } from "@/components/ui/floating-doc-viewer-modal";
import { resolveFileViewerUrl } from "@/lib/r2-utils";

function getUrlFromMap(map: any, key: any): string | null {
  if (!map || key === undefined || key === null) return null;
  if (typeof map.get === "function") {
    return map.get(key) || map.get(String(key)) || null;
  }
  return map[key] || map[String(key)] || null;
}

export function RequestDocumentsCard({
  request,
  signedUrlMap,
}: {
  request: any;
  signedUrlMap: any;
}) {
  const [activeDoc, setActiveDoc] = useState<{
    url: string;
    title: string;
    fileName: string;
  } | null>(null);

  const docs = request.serviceRequestDocuments ?? [];

  return (
    <>
      <Card title="Dokumen Persyaratan" icon={FileCheck}>
        <div className="space-y-2.5">
          {docs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <FileCheck className="h-7 w-7 text-slate-300 mb-1.5" />
              <p className="text-xs text-slate-500 font-semibold">
                Tidak ada dokumen persyaratan untuk layanan ini.
              </p>
            </div>
          )}

          {docs.map((doc: any) => {
            const rawPath = doc.filePath || doc.file_path || doc.url || "";
            const mapUrl =
              getUrlFromMap(signedUrlMap, doc.id) ||
              getUrlFromMap(signedUrlMap, doc.requirementId);
            const url = mapUrl || (rawPath ? resolveFileViewerUrl(rawPath) : "");

            const reqName =
              doc.requirementName ||
              doc.requirement_name ||
              doc.serviceRequirements?.documentName ||
              doc.serviceRequirements?.document_name;
            const title = reqName || doc.fileName || "Dokumen Persyaratan";
            const isUploaded = Boolean(rawPath && rawPath.trim() !== "" && rawPath !== "EXPIRED");
            const isExpired = rawPath === "EXPIRED";
            const isRequired = doc.isRequired ?? true;

            return (
              <div
                key={doc.id || doc.requirementId || title}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border p-3 sm:p-3.5 transition-all ${
                  isUploaded
                    ? "border-emerald-200/70 bg-emerald-50/20 hover:bg-emerald-50/40"
                    : "border-slate-200 bg-slate-50/60 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div
                    className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg border shadow-2xs ${
                      isUploaded
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : "bg-slate-100 border-slate-200 text-slate-400"
                    }`}
                  >
                    {isUploaded ? <FileCheck className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-bold text-xs sm:text-sm text-slate-800 break-words leading-tight" title={title}>
                        {title}
                      </p>
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide ${
                          isRequired
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {isRequired ? "Wajib" : "Opsional"}
                      </span>
                    </div>

                    {isUploaded && doc.fileName && (
                      <p className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
                        File: {doc.fileName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {isExpired ? (
                    <span className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200">
                      <AlertCircle className="h-3 w-3" />
                      Kadaluarsa
                    </span>
                  ) : isUploaded && url ? (
                    <>
                      <span className="hidden md:inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100/60">
                        <CheckCircle2 className="h-3 w-3" />
                        Terunggah
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const targetUrl = url || resolveFileViewerUrl(rawPath);
                          setActiveDoc({
                            url: targetUrl,
                            title,
                            fileName: doc.fileName || title,
                          });
                        }}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-[#059669] bg-emerald-50 border border-emerald-200 hover:bg-[#059669] hover:text-white transition-all shadow-2xs active:scale-95 cursor-pointer touch-manipulation"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Buka File
                      </button>
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200">
                      <Clock className="h-3 w-3" />
                      Belum Diunggah
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* PPID-style Floating Window PDF & Image Viewer Modal */}
      <FloatingDocViewerModal
        isOpen={Boolean(activeDoc)}
        onClose={() => setActiveDoc(null)}
        title={activeDoc?.title || "Dokumen"}
        url={activeDoc?.url || null}
        fileName={activeDoc?.fileName}
      />
    </>
  );
}

