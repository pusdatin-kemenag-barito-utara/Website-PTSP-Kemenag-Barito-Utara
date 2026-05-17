"use client";

import { formatDate } from "@/lib/utils";
import { FileDigit, CheckCircle2, Clock, AlertCircle, Eye } from "lucide-react";

export function DokumenHasilTable({
  paginatedRequests,
  urlMap,
}: {
  paginatedRequests: any[];
  urlMap: Record<string, string | null>;
}) {
  if (paginatedRequests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-400 mb-4">
          <FileDigit className="h-8 w-8" />
        </div>
        <p className="text-sm font-semibold text-slate-700">
          Tidak ada dokumen ditemukan
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Coba gunakan kata kunci pencarian yang lain.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {paginatedRequests.map((request: any) => {
        const fileUrl = urlMap[request.id];
        const isGenerated = !!request.generated_documents;
        const docDate = isGenerated
          ? formatDate(request.generated_documents.generated_at)
          : null;

        return (
          <div
            key={request.id}
            className="p-5 transition-colors hover:bg-slate-50/50 flex flex-col md:flex-row gap-5 md:items-center justify-between"
          >
            {/* Info Permohonan */}
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm border ${
                  isGenerated
                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                    : "bg-slate-50 text-slate-400 border-slate-100"
                }`}
              >
                {isGenerated ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  <Clock className="h-6 w-6" />
                )}
              </div>
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-900 truncate">
                    {request.request_number}
                  </span>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      request.status === "completed"
                        ? "bg-emerald-100 text-emerald-700"
                        : request.status === "under_review"
                          ? "bg-blue-100 text-blue-700"
                          : request.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {request.status.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-700 truncate">
                  {request.profiles?.fullName || "Tanpa Nama"}
                </p>
                <p className="text-xs text-slate-500 truncate max-w-md">
                  {request.services?.name || "Layanan tidak diketahui"}
                </p>
                {isGenerated && (
                  <p className="text-[11px] font-medium text-emerald-600 flex items-center gap-1 mt-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Diperbarui: {docDate}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 shrink-0 ml-16 md:ml-0">
              {request.generated_documents?.file_path === "EXPIRED" ? (
                <span className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-200">
                  <AlertCircle className="h-4 w-4" />
                  Kadaluarsa
                </span>
              ) : fileUrl ? (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 transition-all shadow-sm active:scale-95"
                >
                  <Eye className="h-4 w-4" />
                  Lihat File
                </a>
              ) : (
                <button
                  disabled
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed"
                >
                  <AlertCircle className="h-4 w-4" />
                  Belum Ada
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
