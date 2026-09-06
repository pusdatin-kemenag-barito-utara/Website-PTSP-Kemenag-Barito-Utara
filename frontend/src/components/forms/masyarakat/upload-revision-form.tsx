import { getClientApiBase, getClientAuthToken } from "@/lib/client-api";
import { useState, type FormEvent } from "react";
import { useRouter } from "@/lib/next-compat/navigation";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { compressImageToUnder } from "@/lib/image-compression";

export function UploadRevisionForm({
  requestId,
  requirement,
}: {
  requestId: string;
  requirement: any;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    const rawFormData = new FormData(event.currentTarget);
    const finalFormData = new FormData();

    const entries = Array.from(rawFormData.entries());

    await Promise.all(
      entries.map(async ([key, value]: any) => {
        if (
          value instanceof File &&
          value.size > 800 * 1024 &&
          value.type.startsWith("image/")
        ) {
          const compressedFile = await compressImageToUnder(value, 800);
          finalFormData.append(key, compressedFile);
        } else {
          finalFormData.append(key, value);
        }
      }),
    );

    if (finalFormData.get("file") instanceof File) {
      finalFormData.set("document", finalFormData.get("file") as File);
    }

    const token = getClientAuthToken();
    const response = await fetch(
      `${getClientApiBase()}/admin/requests/${requestId}/documents`,
      {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: finalFormData,
      },
    );
    const result = await response.json().catch(() => ({}));

    setLoading(false);

    if (!response.ok) {
      setError(result.error || "Upload gagal.");
      return;
    }

    setMessage("Dokumen revisi berhasil diupload.");
    router.refresh();
  };

  return (
    <form
      className="space-y-3 rounded-xl border border-slate-200 p-4"
      onSubmit={onSubmit}
    >
      <input type="hidden" name="requirementId" value={requirement.id} />
      <Field
        label={requirement.documentName}
        required={requirement.isRequired}
        hint={`Format: ${requirement.allowedExtensions || "pdf,jpg,jpeg,png"} | Maks: ${requirement.maxFileSizeMb} MB`}
      >
        <Input
          type="file"
          name="file"
          required
          accept={(requirement.allowedExtensions || "pdf,jpg,jpeg,png")
            .split(",")
            .map((ext: string) => `.${ext.trim()}`)
            .join(",")}
        />
      </Field>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      {message && <p className="text-xs text-emerald-500 font-medium">{message}</p>}
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "Mengupload..." : "Upload Revisi"}
      </Button>
    </form>
  );
}
