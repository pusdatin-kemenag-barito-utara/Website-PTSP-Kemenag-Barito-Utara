import { Card } from "@/components/ui/card";
import { FileCheck, FileText, AlertCircle, ExternalLink } from "lucide-react";

export function RequestDocumentsCard({
  request,
  signedUrlMap,
}: {
  request: any;
  signedUrlMap: Map<string, string | null>;
}) {
  return (
    <Card title="Dokumen Persyaratan" icon={FileCheck}>
      <div className="space-y-3">
        {(request.service_request_documents ?? []).length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <FileCheck className="h-8 w-8 text-slate-300 mb-2" />
            <p className="text-sm text-slate-500 font-semibold">
              Tidak ada dokumen persyaratan.
            </p>
          </div>
        )}
        {(request.service_request_documents ?? []).map((doc: any) => (
          <div
            key={doc.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 hover:bg-white hover:shadow-sm transition-all"
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 shadow-sm">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-slate-800 truncate">
                  {doc.service_requirements?.document_name || doc.file_name}
                </p>
                <p className="text-xs font-medium text-slate-400 mt-0.5 truncate">
                  {doc.file_name}
                </p>
              </div>
            </div>
            {doc.file_path === "EXPIRED" ? (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 border border-red-200">
                <AlertCircle className="h-3 w-3" />
                Kadaluarsa
              </span>
            ) : signedUrlMap.get(doc.id) ? (
              <a
                href={signedUrlMap.get(doc.id)!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-[#1f4bb7] bg-blue-50 border border-blue-100 hover:bg-[#1f4bb7] hover:text-white transition-all shadow-sm active:scale-95"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Lihat File
              </a>
            ) : null}
          </div>
        ))}
      </div>
    </Card>
  );
}
