import { getClientApiBase, getClientAuthToken, getSessionUserId } from "@/lib/client-api";
import { useState, type FormEvent } from "react";
import { useRouter } from "@/lib/next-compat/navigation";
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
  requirementId: string;
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

    // Add answers
    const updates = answers.map((answer: any) => ({
      fieldName: answer.fieldName,
      fieldValue: rawFormData.get(`answer_${answer.id}`) as string,
    }));

    // Add files
    const fileEntries = Array.from(rawFormData.entries()).filter(([key]: any) =>
      key.startsWith("requirement_"),
    );

    try {
      const userId = await getSessionUserId();
      if (!userId) {
        throw new Error("Silakan login terlebih dahulu.");
      }

      const updateRes = await fetch(`${getClientApiBase()}/requests/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, answers: updates }),
      });
      const result = await updateRes.json().catch(() => ({}));

      if (!updateRes.ok) {
        throw new Error(result.error || "Gagal mengupdate pengajuan.");
      }

      const token = getClientAuthToken();
      const uploads = fileEntries.map(async ([key, value]: any) => {
        if (!(value instanceof File) || value.size === 0) return;
        let file = value;
        if (file.type.startsWith("image/")) {
          file = await compressImageToUnder(value, 800);
        }
        const uploadForm = new FormData();
        uploadForm.append("document", file, file.name);
        uploadForm.append("requirementId", key.replace("requirement_", ""));
        uploadForm.append("category", "umum");
        await fetch(`${getClientApiBase()}/admin/requests/${requestId}/documents`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: uploadForm,
        });
      });
      await Promise.all(uploads);

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
          onClick={() => onSuccess?.()}
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
