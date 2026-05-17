import { Layers } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { db, serializeBigInt } from "@/lib/db";
import {
  services as servicesTable,
  serviceItems as serviceItemsTable,
} from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { PageHeader } from "@/components/admin/page-header";
import { ItemLayananClient } from "@/components/admin/item-layanan/item-layanan-client";
import { isSuperAdmin, getAdminSpecificRole } from "@/lib/constants";
import { eq, sql } from "drizzle-orm";

export default async function AdminServiceItemsPage() {
  const profile = await requireAdmin();
  const isSuper = isSuperAdmin(profile.email);
  const specificRole = getAdminSpecificRole(profile.email, profile.role ?? "");
  const isGeneralAdmin = specificRole === "admin_ptsp";

  const roleOwnerFilter = isSuper || isGeneralAdmin ? undefined : specificRole;

  let servicesWhere = undefined;
  let itemsWhere = undefined;

  if (roleOwnerFilter) {
    servicesWhere = eq(servicesTable.roleOwner, roleOwnerFilter as any);
    itemsWhere = sql`EXISTS (SELECT 1 FROM services WHERE services.id = ${serviceItemsTable.serviceId} AND services.role_owner = ${roleOwnerFilter})`;
  }

  const [servicesData, itemsData] = await Promise.all([
    db.query.services.findMany({
      where: servicesWhere,
      orderBy: [asc(servicesTable.name)],
    }),
    db.query.serviceItems.findMany({
      where: itemsWhere,
      with: {
        service: {
          columns: { name: true },
        },
      },
      orderBy: [asc(serviceItemsTable.sortOrder)],
    }),
  ]);

  const services = serializeBigInt(servicesData);
  const items = serializeBigInt(itemsData);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelola Item Layanan"
        description="Kelola daftar sub-layanan, formulir, dan persyaratan untuk setiap induk layanan."
        icon={Layers}
      />
      <ItemLayananClient
        initialItems={items ?? []}
        services={services ?? []}
        isSuperAdmin={isSuper}
      />
    </div>
  );
}
