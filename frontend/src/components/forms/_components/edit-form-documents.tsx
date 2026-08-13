import { Input } from "@/components/ui/input";
import { FileUp } from "lucide-react";
import { toast } from "sonner";

export function EditFormDocuments({ documents }: { documents: any[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <div className="h-2 w-2 rounded-full bg-green-500"></div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Update Dokumen
        </h3>
      </div>
      <div className="grid gap-3">
        {documents.map((doc: any) => (
          <div
            key={doc.id}
            className="group relative rounded-xl border border-slate-200 bg-slate-50/30 p-3 transition-all hover:border-emerald-200 hover:bg-emerald-50/20"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  {doc.serviceRequirements?.documentName || doc.fileName}
                </span>
                <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                  File saat ini: {doc.fileName}
                </span>
              </div>
              <div className="relative">
                <Input
                  type="file"
                  name={`requirement_${doc.requirementId}`}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      toast.info(`File terpilih: ${file.name}`, {
                        description:
                          "Nama file akan diperbarui setelah disimpan.",
                        duration: 2000,
                      });
                    }
                  }}
                  className="h-10 py-1.5 text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-3 file:py-1 file:text-[10px] file:font-bold file:text-white hover:file:bg-emerald-700 transition-all cursor-pointer border-slate-200"
                />
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <FileUp className="h-4 w-4 text-emerald-500" />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 italic">
                Kosongkan jika tidak ingin mengganti dokumen ini.
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
