"use client";

import { useState } from "react";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ModernSelect } from "@/components/ui/modern-select";
import { ModernDatePicker } from "@/components/ui/modern-date-picker";
import { parseJsonArray } from "@/lib/utils";
import { ListOrdered, Type, AlignLeft, Calendar, Hash } from "lucide-react";

// Wrapper for date field to manage controlled state
function DateFieldWrapper({ field }: { field: any }) {
  const [dateValue, setDateValue] = useState("");
  return (
    <ModernDatePicker
      name={`answer_${field.id}`}
      value={dateValue}
      onChange={setDateValue}
      required={field.isRequired}
    />
  );
}

// Wrapper for select field to manage controlled state
function SelectFieldWrapper({ field }: { field: any }) {
  const [selectValue, setSelectValue] = useState("");
  const options = parseJsonArray(field.options).map((opt) => ({
    value: opt,
    label: opt,
  }));
  return (
    <ModernSelect
      name={`answer_${field.id}`}
      options={options}
      value={selectValue}
      onChange={setSelectValue}
      placeholder={field.placeholder || "Pilih salah satu"}
      icon={ListOrdered}
      required={field.isRequired}
      enableSearch={options.length > 5}
    />
  );
}

export function RequestFormFields({ fields }: { fields: any[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-5">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#059669]">
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
        {[...fields]
          .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
          .map((field: any) => {
            const handleInvalid = (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
              const target = e.target as HTMLInputElement | HTMLTextAreaElement;
              target.setCustomValidity(`Harap isi kolom ${field.label} terlebih dahulu.`);
            };

            const handleInput = (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
              const target = e.target as HTMLInputElement | HTMLTextAreaElement;
              target.setCustomValidity("");
            };

            const commonInput = {
              name: `answer_${field.id}`,
              required: field.isRequired,
              placeholder: field.placeholder || "",
              onInvalid: handleInvalid,
              onInput: handleInput,
              onChange: handleInput,
            };

            const icon =
              field.type === "select" ? ListOrdered :
              field.type === "date" ? Calendar :
              field.type === "number" ? Hash :
              field.type === "textarea" ? AlignLeft :
              Type;

            return (
              <div
                key={field.id}
                className={field.type === "textarea" ? "md:col-span-2" : ""}
              >
                <Field label={field.label} required={field.isRequired}>
                  {field.type === "textarea" ? (
                    <Textarea {...commonInput} className="min-h-[96px] resize-none" />
                  ) : field.type === "select" ? (
                    <SelectFieldWrapper field={field} />
                  ) : field.type === "date" ? (
                    <DateFieldWrapper field={field} />
                  ) : field.type === "number" ? (
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      <Input
                        type="number"
                        {...commonInput}
                        className="pl-9"
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      <Input
                        type="text"
                        {...commonInput}
                        className="pl-9"
                      />
                    </div>
                  )}
                </Field>
              </div>
            );
          })}
      </div>
    </section>
  );
}

