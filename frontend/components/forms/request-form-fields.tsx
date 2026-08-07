"use client";

import { useState } from "react";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ModernSelect } from "@/components/ui/modern-select";
import { ModernMultiDatePicker } from "@/components/ui/modern-multi-date-picker";
import { parseJsonArray } from "@/lib/utils";
import { ListOrdered, Type, AlignLeft, Calendar, Hash } from "lucide-react";

// Wrapper for date field to manage controlled state
function DateFieldWrapper({ field }: { field: any }) {
  const [dateValue, setDateValue] = useState("");

  return (
    <div className="space-y-2 relative">
      <ModernMultiDatePicker
        name={`answer_${field.id}`}
        value={dateValue}
        onChange={setDateValue}
        required={field.isRequired}
      />
    </div>
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

export function RequestFormFields({
  fields,
  profile,
}: {
  fields: any[];
  profile?: any;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 w-full">
      {(() => {
        let sortedFields = [...fields].sort(
          (a: any, b: any) => a.sortOrder - b.sortOrder,
        );

        const tmIndex = sortedFields.findIndex((f) =>
          f.label.toLowerCase().includes("tanggal mulai"),
        );
        let tsIndex = sortedFields.findIndex((f) =>
          f.label.toLowerCase().includes("tanggal selesai"),
        );
        const waIndex = sortedFields.findIndex(
          (f) => f.type === "tel" || f.label.toLowerCase().includes("whatsapp"),
        );

        if (tmIndex !== -1 && tsIndex !== -1 && waIndex !== -1) {
          sortedFields[tmIndex] = {
            ...sortedFields[tmIndex],
            label: "Tanggal Mulai - Selesai Cuti",
          };
          const waField = sortedFields[waIndex];
          sortedFields.splice(waIndex, 1);

          tsIndex = sortedFields.findIndex((f) =>
            f.label.toLowerCase().includes("tanggal selesai"),
          );
          if (tsIndex !== -1) {
            sortedFields[tsIndex] = waField;
          }
        }

        return sortedFields.map((field: any) => {
          const isWhatsApp =
            field.type === "tel" ||
            field.label.toLowerCase().includes("whatsapp");
          const hasPhoneProfile = isWhatsApp && profile?.phone;

          const handleInvalid = (
            e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
          ) => {
            const target = e.target as HTMLInputElement | HTMLTextAreaElement;
            target.setCustomValidity(
              `Harap isi kolom ${field.label} terlebih dahulu.`,
            );
          };

          const handleInput = (
            e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
          ) => {
            const target = e.target as HTMLInputElement | HTMLTextAreaElement;
            target.setCustomValidity("");
            if (field.type === "tel" && !hasPhoneProfile) {
              target.value = target.value.replace(/\D/g, "");
            }
          };

          let formattedPhone = profile?.phone || "";
          if (formattedPhone.startsWith("62")) {
            formattedPhone = "0" + formattedPhone.slice(2);
          }

          const commonInput = {
            name: `answer_${field.id}`,
            required: field.isRequired,
            placeholder: field.placeholder || (field.type === "tel" ? "Contoh: 081234567890" : ""),
            onInvalid: handleInvalid,
            onInput: handleInput,
            onChange: handleInput,
            ...(field.type === "tel" && formattedPhone ? { defaultValue: formattedPhone } : {}),
          };

          const isHalfWidthTextarea =
            field.type === "textarea" &&
            (field.label.toLowerCase().includes("alasan") ||
              field.label.toLowerCase().includes("alamat"));

          return (
            <div
              key={field.id}
              className={
                field.type === "textarea" && !isHalfWidthTextarea
                  ? "md:col-span-2"
                  : ""
              }
            >
              <Field label={field.label} required={field.isRequired}>
                {field.type === "textarea" ? (
                  <Textarea
                    {...commonInput}
                    className="min-h-[96px] resize-none"
                  />
                ) : field.type === "select" ? (
                  <SelectFieldWrapper field={field} />
                ) : field.type === "date" ? (
                  <DateFieldWrapper field={field} />
                ) : (
                  <div className="space-y-1.5">
                    <Input
                      type={field.type}
                      {...commonInput}
                    />
                    {field.type === "tel" && (
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Notifikasi status permohonan akan dikirim ke nomor ini. Pastikan nomor WhatsApp aktif.
                      </p>
                    )}
                  </div>
                )}
              </Field>
            </div>
          );
        });
      })()}
    </div>
  );
}
