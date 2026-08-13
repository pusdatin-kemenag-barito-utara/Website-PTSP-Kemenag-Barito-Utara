import { PageHeader } from "@/components/admin/page-header";
import { FormInput } from "lucide-react";
import { FormLayananClient } from "@/components/admin/form-layanan/form-layanan-client";

export function FormLayananView({
  fields,
  items,
}: {
  fields: any[];
  items: any[];
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelola Form Layanan"
        description="Atur field form dinamis yang digunakan oleh tiap item layanan."
        icon={FormInput}
      />
      <FormLayananClient initialFields={fields ?? []} items={items ?? []} />
    </div>
  );
}

export default FormLayananView;
