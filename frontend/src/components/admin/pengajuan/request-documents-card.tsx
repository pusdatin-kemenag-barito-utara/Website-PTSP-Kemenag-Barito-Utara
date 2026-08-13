import { useState } from "react";
import { Card } from "@/components/ui/card";
import { FileCheck, FileText, AlertCircle, Eye } from "lucide-react";
import { FloatingDocViewerModal } from "@/components/ui/floating-doc-viewer-modal";

export function RequestDocumentsCard({
  request,
  signedUrlMap,
}: {
  request: any;
  signedUrlMap: Map<string, string | null>;
}) {
  const [activeDoc, setActiveDoc] = useState<{
    url: string;
    title: string;
    fileName: string;
  } | null>(null);

  return (
    <>
      <Card title="Dokumen Persyaratan" icon={FileCheck}>
        <div className="space-y-3">
          {(request.serviceRequestDocuments ?? []).length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <FileCheck className="h-8 w-8 text-slate-300 mb-2" />
              <p className="text-sm text-slate-500 font-semibold">
                Tidak ada dokumen persyaratan.
              </p>
            </div>
          )}
          {(request.serviceRequestDocuments ?? []).map((doc: any) => {
            const url = signedUrlMap.get(doc.id);
            const reqName = doc.requirementName || doc.requirement_name || doc.serviceRequirements?.documentName || doc.serviceRequirements?.document_name;
            const title = reqName || "Dokumen Persyaratan";

            return (
              <div
                key={doc.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5 sm:p-4 hover:bg-white hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-3 min-w-0 w-full overflow-hidden">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200 text-emerald-600 shadow-sm">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <p className="font-bold text-xs sm:text-sm text-slate-800 break-words leading-snug" title={title}>
                      {title}
                    </p>
                  </div>
                </div>
                {doc.filePath === "EXPIRED" ? (
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 border border-red-200 self-start sm:self-auto">
                    <AlertCircle className="h-3 w-3" />
                    Kadaluarsa
                  </span>
                ) : url ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveDoc({
                        url,
                        title,
                        fileName: doc.fileName,
                      });
                    }}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-[#059669] bg-emerald-50 border border-emerald-100 hover:bg-[#059669] hover:text-white active:bg-[#059669] active:text-white transition-all shadow-sm active:scale-95 cursor-pointer w-full sm:w-auto touch-manipulation z-10"
                  >
                    <Eye className="h-4 w-4" />
                    Buka File
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Floating Window PDF & Image Viewer Modal */}
      <FloatingDocViewerModal
        isOpen={!!activeDoc}
        onClose={() => setActiveDoc(null)}
        title={activeDoc?.title || "Dokumen"}
        url={activeDoc?.url || null}
        fileName={activeDoc?.fileName}
      />
    </>
  );
}
