import { FileText } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { db, serializeBigInt } from "@/lib/db";
import {
  serviceItems as serviceItemsTable,
  serviceRequirements as serviceRequirementsTable,
} from "@/lib/db/schema";
import { asc, sql } from "drizzle-orm";
import { PageHeader } from "@/components/admin/page-header";
import { PersyaratanClient } from "@/components/admin/persyaratan/persyaratan-client";
import { isSuperAdmin, getAdminSpecificRole } from "@/lib/constants";

export default async function AdminRequirementsPage() {
  const profile = await requireAdmin();
  const isSuper = isSuperAdmin(profile.email);
  const specificRole = getAdminSpecificRole(profile.email, profile.role ?? "");
  const isGeneralAdmin = specificRole === "admin_ptsp";

  const roleOwnerFilter = isSuper || isGeneralAdmin ? undefined : specificRole;

  let itemsWhere = undefined;
  let requirementsWhere = undefined;

  if (roleOwnerFilter) {
    itemsWhere = sql`EXISTS (SELECT 1 FROM ptsp_services WHERE ptsp_services.id = ${serviceItemsTable.serviceId} AND ptsp_services.role_owner = ${roleOwnerFilter})`;
    requirementsWhere = sql`EXISTS (SELECT 1 FROM ptsp_service_items JOIN ptsp_services ON ptsp_service_items.service_id = ptsp_services.id WHERE ptsp_service_items.id = ${serviceRequirementsTable.serviceItemId} AND ptsp_services.role_owner = ${roleOwnerFilter})`;
  }

  const [itemsData, requirementsData] = await Promise.all([
    db.query.serviceItems.findMany({
      where: itemsWhere,
      columns: { id: true, name: true },
      orderBy: [asc(serviceItemsTable.name)],
    }),
    db.query.serviceRequirements.findMany({
      where: requirementsWhere,
      with: {
        serviceItem: {
          columns: { name: true },
        },
      },
      orderBy: [
        asc(serviceRequirementsTable.serviceItemId),
        asc(serviceRequirementsTable.id),
      ],
    }),
  ]);

  const items = serializeBigInt(itemsData);
  const requirements = serializeBigInt(requirementsData);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelola Persyaratan"
        description="Atur dokumen persyaratan yang harus diunggah untuk tiap item layanan."
        icon={FileText}
      />
      <PersyaratanClient
        initialRequirements={requirements ?? []}
        items={items ?? []}
      />
    </div>
  );
}
