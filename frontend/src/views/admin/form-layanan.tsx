import { FormLayananClient } from "@/components/admin/form-layanan/form-layanan-client";

export function FormLayananView({
  fields,
  items,
}: {
  fields: any[];
  items: any[];
}) {
  return (
    <div className="space-y-4 pb-6">
      <FormLayananClient initialFields={fields ?? []} items={items ?? []} />
    </div>
  );
}

export default FormLayananView;
