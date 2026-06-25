"use client";

import { FileText, ExternalLink, AlertCircle } from "lucide-react";

interface RequestDocumentsCardProps {
  documents: any[];
  signedUrlMap: Map<string, string | null>;
}

export function RequestDocumentsCard({
  documents,
  signedUrlMap,
}: RequestDocumentsCardProps) {
  return (
    <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-sm border border-slate-200">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <FileText className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-black text-slate-900 tracking-tight">
          Dokumen Persyaratan
        </h3>
      </div>

      <div className="space-y-3">
        {documents.map((doc: any) => (
          <div
            key={doc.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl sm:rounded-2xl bg-slate-50 p-4 sm:p-5 hover:bg-emerald-50/50 hover:border-emerald-100 border border-transparent transition-all group"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors shadow-sm shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-800 tracking-tight leading-none mb-1">
                  {doc.serviceRequirements?.documentName || doc.fileName}
                </p>
                <p className="text-[10px] font-bold text-slate-400 truncate max-w-[200px]">
                  {doc.fileName}
                </p>
              </div>
            </div>
            {signedUrlMap.get(doc.id) && (
              <a
                href={signedUrlMap.get(doc.id)!}
                target="_blank"
                className="inline-flex items-center justify-center gap-2 h-9 sm:h-10 px-4 sm:px-6 rounded-xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-emerald-600 hover:text-emerald-600 transition-all shadow-sm"
              >
                Preview <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        ))}

        {!documents.length && (
          <div className="py-12 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-slate-200 mb-3" />
            <p className="text-sm font-bold text-slate-400">
              Belum ada dokumen terupload.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
