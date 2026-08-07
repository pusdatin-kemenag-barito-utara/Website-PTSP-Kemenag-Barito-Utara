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
    <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-hidden transition-colors">
      <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 px-5 py-4 flex items-center gap-3">
        <div className="h-8 w-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <FileText className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
          Dokumen Persyaratan
        </h3>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
        {documents.map((doc: any) => (
          <div
            key={doc.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 border border-emerald-100 dark:border-emerald-900/40">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100 leading-snug line-clamp-2">
                  {doc.serviceRequirements?.documentName || doc.fileName}
                </p>
                <p 
                  className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 truncate max-w-[200px] sm:max-w-[320px] mt-0.5" 
                  title={doc.fileName}
                >
                  {(() => {
                    const fname = doc.fileName || "";
                    if (fname.length > 28) {
                      const ext = fname.includes(".") ? `.${fname.split(".").pop()}` : "";
                      return `${fname.substring(0, 18)}...${ext}`;
                    }
                    return fname;
                  })()}
                </p>
              </div>
            </div>
            {signedUrlMap.get(doc.id) && (
              <a
                href={signedUrlMap.get(doc.id)!}
                target="_blank"
                rel="noreferrer"
                className="group relative inline-flex items-center justify-center gap-2 h-9 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/35 transition-all duration-300 hover:scale-[1.03] active:scale-95 shrink-0 self-stretch sm:self-auto overflow-hidden"
              >
                {/* Shimmer animation */}
                <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out pointer-events-none" />
                <span>Lihat Dokumen</span>
                <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            )}
          </div>
        ))}

        {!documents.length && (
          <div className="py-10 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
              Belum ada dokumen yang diunggah.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
