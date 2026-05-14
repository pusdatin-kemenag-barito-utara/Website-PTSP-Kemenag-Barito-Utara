import { requireAdmin } from "@/lib/auth";
import prisma, { serializeBigInt } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { FormInput } from "lucide-react";
import { FormLayananClient } from "@/components/admin/form-layanan/form-layanan-client";

export default async function AdminFormFieldsPage() {
  await requireAdmin();

  const [itemsData, fieldsData] = await Promise.all([
    prisma.service_items.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.service_form_fields.findMany({
      include: {
        service_items: {
          select: { name: true },
        },
      },
      orderBy: [
        { service_item_id: "asc" },
        { sort_order: "asc" },
      ],
    }),
  ]);

  const items = serializeBigInt(itemsData);
  const fields = serializeBigInt(fieldsData);

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
