import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { parseJsonArray } from "@/lib/utils";

export function RequestFormFields({ fields }: { fields: any[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#1f4bb7]">
          Langkah 2
        </p>
        <h3 className="mt-1 text-base font-bold text-slate-900 sm:text-lg">
          Isi Data Formulir
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Lengkapi data sesuai kebutuhan item layanan yang dipilih.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {fields
          .sort((a: any, b: any) => a.sort_order - b.sort_order)
          .map((field: any) => {
            const common = {
              name: `answer_${field.id}`,
              required: field.is_required,
              placeholder: field.placeholder || "",
            };

            return (
              <div
                key={field.id}
                className={field.type === "textarea" ? "md:col-span-2" : ""}
              >
                <Field label={field.label} required={field.is_required}>
                  {field.type === "textarea" ? (
                    <Textarea {...common} />
                  ) : field.type === "select" ? (
                    <Select {...common}>
                      <option value="">Pilih salah satu</option>
                      {parseJsonArray(field.options).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </Select>
                  ) : field.type === "date" ? (
                    <Input type="date" {...common} />
                  ) : field.type === "number" ? (
                    <Input type="number" {...common} />
                  ) : (
                    <Input type="text" {...common} />
                  )}
                </Field>
              </div>
            );
          })}
      </div>
    </section>
  );
}
