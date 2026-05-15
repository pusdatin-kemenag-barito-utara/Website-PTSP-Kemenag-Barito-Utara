"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { FileUp, Save, X } from "lucide-react";
import { compressImageToUnder } from "@/lib/image-compression";

interface Answer {
  id: string;
  field_name: string;
  field_value: string;
}

interface Document {
  id: string;
  file_name: string;
  file_path: string;
  service_requirements?: {
    document_name: string;
  };
}

export function EditRequestForm({
  requestId,
  answers,
  documents,
  onSuccess,
}: {
  requestId: string;
  answers: Answer[];
  documents: Document[];
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const rawFormData = new FormData(e.currentTarget);
    const finalFormData = new FormData();

    // Add answers
    const updates = answers.map((answer: any) => ({
      id: answer.id,
      field_value: rawFormData.get(`answer_${answer.id}`) as string,
    }));
    finalFormData.append("answers", JSON.stringify(updates));

    // Add files
    const fileEntries = Array.from(rawFormData.entries()).filter(([key]: any) =>
      key.startsWith("doc_"),
    );

    await Promise.all(
      fileEntries.map(async ([key, value]: any) => {
        if (value instanceof File && value.size > 0) {
          if (value.type.startsWith("image/")) {
            const compressed = await compressImageToUnder(value, 150);
            finalFormData.append(key, compressed);
          } else {
            finalFormData.append(key, value);
          }
        }
      }),
    );

    try {
      const response = await fetch(`/api/requests/${requestId}/update`, {
        method: "POST", // Use POST for FormData with files
        body: finalFormData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal mengupdate pengajuan.");
      }

      toast.success("Berhasil", {
        description: "Data dan dokumen pengajuan berhasil diperbarui.",
      });

      // Give a small delay before refresh/reload to ensure DB consistency
      setTimeout(() => {
        router.refresh();
        if (onSuccess) {
          onSuccess();
        } else {
          // Hard reload if no success handler to force fresh data
          window.location.reload();
        }
      }, 500);
    } catch (err: any) {
      toast.error("Gagal", {
        description: err.message || "Terjadi kesalahan.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Data Formulir
          </h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {answers.map((answer: any) => (
            <div key={answer.id} className="space-y-1.5">
              <label
                htmlFor={`answer_${answer.id}`}
                className="text-xs font-bold text-slate-600 uppercase tracking-tight"
              >
                {answer.field_name}
              </label>
              <Input
                id={`answer_${answer.id}`}
                name={`answer_${answer.id}`}
                defaultValue={answer.field_value || ""}
                className="bg-slate-50/50 focus:bg-white transition-colors"
                required
              />
            </div>
          ))}
        </div>
      </div>

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
                    {doc.service_requirements?.document_name || doc.file_name}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                    File saat ini: {doc.file_name}
                  </span>
                </div>
                <div className="relative">
                  <Input
                    type="file"
                    name={`doc_${doc.id}`}
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

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
        <Button
          type="button"
          variant="outline"
          onClick={onSuccess}
          className="h-11 px-6 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          Batal
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="h-11 px-8 rounded-xl bg-[#059669] text-white shadow-lg shadow-emerald-500/20 hover:bg-[#047857] hover:shadow-emerald-500/40 transition-all gap-2"
        >
          {loading ? (
            "Menyimpan..."
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Simpan Perubahan</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
