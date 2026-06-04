import { requirePermission } from "@/lib/auth";
import { db, serializeBigInt } from "@/lib/db";
import {
  serviceItems as serviceItemsTable,
  serviceFormFields as serviceFormFieldsTable,
} from "@/lib/db/schema";
import { asc, sql } from "drizzle-orm";
import { PageHeader } from "@/components/admin/page-header";
import { FormInput } from "lucide-react";
import { FormLayananClient } from "@/components/admin/form-layanan/form-layanan-client";
import { isSuperAdmin, getAdminSpecificRole } from "@/lib/constants";

export default async function AdminFormFieldsPage() {
  const profile = await requirePermission("layanan");
  const isSuper = isSuperAdmin(profile.email);
  const specificRole = getAdminSpecificRole(profile.email, profile.role ?? "");
  const isGeneralAdmin = specificRole === "admin_ptsp";

  const roleOwnerFilter = isSuper || isGeneralAdmin ? undefined : specificRole;

  let itemsWhere = undefined;
  let fieldsWhere = undefined;

  if (roleOwnerFilter) {
    itemsWhere = sql`EXISTS (SELECT 1 FROM ptsp_services WHERE ptsp_services.id = ${serviceItemsTable.serviceId} AND ptsp_services.role_owner = ${roleOwnerFilter})`;
    fieldsWhere = sql`EXISTS (SELECT 1 FROM ptsp_service_items JOIN ptsp_services ON ptsp_service_items.service_id = ptsp_services.id WHERE ptsp_service_items.id = ${serviceFormFieldsTable.serviceItemId} AND ptsp_services.role_owner = ${roleOwnerFilter})`;
  }

  const [itemsData, fieldsData] = await Promise.all([
    db.query.serviceItems.findMany({
      where: itemsWhere,
      columns: { id: true, name: true },
      orderBy: [asc(serviceItemsTable.name)],
    }),
    db.query.serviceFormFields.findMany({
      where: fieldsWhere,
      with: {
        serviceItem: {
          columns: { name: true },
        },
      },
      orderBy: [
        asc(serviceFormFieldsTable.serviceItemId),
        asc(serviceFormFieldsTable.sortOrder),
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
