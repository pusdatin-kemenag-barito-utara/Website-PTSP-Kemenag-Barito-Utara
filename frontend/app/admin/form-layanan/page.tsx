import { requirePermission } from "@/lib/auth";
import { fetchAPI } from "@/lib/api";
import { PageHeader } from "@/components/admin/page-header";
import { FormInput } from "lucide-react";
import { FormLayananClient } from "@/components/admin/form-layanan/form-layanan-client";

export default async function AdminFormFieldsPage() {
  await requirePermission("layanan");

  let items: any[] = [];
  let fields: any[] = [];

  try {
    const servicesRes = await fetchAPI<any>("/services");
    if (servicesRes && servicesRes.data && Array.isArray(servicesRes.data)) {
      servicesRes.data.forEach((s: any) => {
        if (s.items && Array.isArray(s.items)) {
          items.push(...s.items);
          s.items.forEach((item: any) => {
            if (item.formFields && Array.isArray(item.formFields)) {
              item.formFields.forEach((f: any) => {
                fields.push({
                  ...f,
                  serviceItem: { name: item.name },
                });
              });
            }
          });
        }
      });
    }
  } catch (err) {
    console.error("Failed to fetch form fields from Golang API:", err);
  }

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
