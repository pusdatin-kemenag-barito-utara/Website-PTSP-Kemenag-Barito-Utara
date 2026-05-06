import { Card } from "@/components/ui/card";
import { Download, FileCheck, Eye } from "lucide-react";
import { UploadResultButton } from "@/components/admin/upload-result-button";

export function ResultDocumentCard({
  request,
  generatedDoc,
  generatedUrl,
}: {
  request: any;
  generatedDoc: any;
  generatedUrl: string | null;
}) {
  return (
    <Card title="Dokumen Hasil" icon={Download}>
      <div className="flex flex-col sm:flex-row items-start gap-4 bg-slate-50 rounded-2xl border border-slate-200/80 p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
          <FileCheck className="h-6 w-6" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h4 className="text-sm font-bold text-slate-800">
            Berkas Hasil Layanan
          </h4>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Dokumen ini akan diterbitkan kepada pemohon.
          </p>
          {generatedDoc ? (
            <p className="mt-1.5 text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
              <FileCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span className="truncate max-w-[260px]">
                {generatedDoc.file_name}
              </span>
            </p>
          ) : (
            <p className="mt-1.5 text-[11px] text-slate-400 italic">
              Belum ada berkas yang diunggah.
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 self-center sm:self-auto">
          <UploadResultButton requestId={request.id} hasFile={!!generatedDoc} />
          {generatedUrl && (
            <a
              href={generatedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95 h-[38px]"
            >
              <Eye className="h-4 w-4" />
              Lihat File
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}
