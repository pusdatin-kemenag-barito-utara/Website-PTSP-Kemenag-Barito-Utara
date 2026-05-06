import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function RequestRequirementUpload({
  requirements,
}: {
  requirements: any[];
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#1f4bb7]">
          Langkah 3
        </p>
        <h3 className="mt-1 text-base font-bold text-slate-900 sm:text-lg">
          Upload Dokumen Persyaratan
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Unggah dokumen dengan format dan ukuran sesuai ketentuan.
        </p>
      </div>

      {requirements.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {requirements.map((requirement: any) => (
            <div
              key={requirement.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4"
            >
              <Field
                label={requirement.document_name}
                required={requirement.is_required}
                hint={`Format: ${requirement.allowed_extensions || "pdf,jpg,jpeg,png"} | Maks: ${requirement.max_file_size_mb} MB`}
              >
                <Input
                  type="file"
                  name={`requirement_${requirement.id}`}
                  required={requirement.is_required}
                  accept={(requirement.allowed_extensions || "pdf,jpg,jpeg,png")
                    .split(",")
                    .map((ext: string) => `.${ext.trim()}`)
                    .join(",")}
                />
              </Field>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-500">
          Item layanan ini tidak memiliki dokumen wajib.
        </p>
      )}
    </section>
  );
}
