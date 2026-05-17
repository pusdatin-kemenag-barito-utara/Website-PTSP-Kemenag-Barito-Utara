"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Save } from "lucide-react";
import { compressImageToUnder } from "@/lib/image-compression";
import { EditFormFields } from "./_components/edit-form-fields";
import { EditFormDocuments } from "./_components/edit-form-documents";

interface Answer {
  id: string;
  fieldName: string;
  fieldValue: string;
}

interface Document {
  id: string;
  fileName: string;
  filePath: string;
  serviceRequirements?: {
    documentName: string;
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
      fieldValue: rawFormData.get(`answer_${answer.id}`) as string,
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
      <EditFormFields answers={answers} />
      <EditFormDocuments documents={documents} />

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
