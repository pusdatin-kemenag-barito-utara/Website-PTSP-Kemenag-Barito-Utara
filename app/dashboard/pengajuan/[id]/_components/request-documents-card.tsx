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
    <div className="rounded-xl bg-white shadow-sm border border-slate-200 overflow-hidden">
      <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center gap-3">
        <FileText className="h-5 w-5 text-slate-500" />
        <h3 className="text-base font-semibold text-slate-900">
          Dokumen Persyaratan
        </h3>
      </div>

      <div className="divide-y divide-slate-100">
        {documents.map((doc: any) => (
          <div
            key={doc.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 leading-none mb-1">
                  {doc.serviceRequirements?.documentName || doc.fileName}
                </p>
                <p className="text-xs text-slate-500 truncate max-w-[250px]">
                  {doc.fileName}
                </p>
              </div>
            </div>
            {signedUrlMap.get(doc.id) && (
              <a
                href={signedUrlMap.get(doc.id)!}
                target="_blank"
                className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shrink-0"
              >
                Lihat Dokumen <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        ))}

        {!documents.length && (
          <div className="py-12 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-slate-300 mb-3" />
            <p className="text-sm text-slate-500">
              Belum ada dokumen yang diunggah.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
