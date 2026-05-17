import { db, serializeBigInt } from "@/lib/db";
import {
  services,
  serviceItems,
  serviceRequirements,
  serviceFormFields,
} from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function getPublicServices() {
  const data = await db.query.services.findMany({
    where: eq(services.isActive, true),
    with: {
      serviceItems: {
        orderBy: [asc(serviceItems.sortOrder), asc(serviceItems.name)],
        with: {
          serviceRequirements: {
            orderBy: [
              asc(serviceRequirements.sortOrder),
              asc(serviceRequirements.id),
            ],
          },
        },
      },
    },
    orderBy: [asc(services.sortOrder), asc(services.name)],
  });

  return serializeBigInt(data) ?? [];
}

export async function getServiceBySlug(slug: string) {
  const data = await db.query.services.findFirst({
    where: eq(services.slug, slug),
    with: {
      serviceItems: {
        orderBy: [asc(serviceItems.sortOrder), asc(serviceItems.name)],
        with: {
          serviceFormFields: {
            orderBy: [asc(serviceFormFields.sortOrder)],
          },
          serviceRequirements: {
            orderBy: [
              asc(serviceRequirements.sortOrder),
              asc(serviceRequirements.id),
            ],
          },
        },
      },
    },
  });

  return serializeBigInt(data);
}

export async function getServiceCatalog() {
  const data = await db.query.services.findMany({
    where: eq(services.isActive, true),
    with: {
      serviceItems: {
        orderBy: [asc(serviceItems.sortOrder), asc(serviceItems.name)],
        with: {
          serviceFormFields: {
            orderBy: [asc(serviceFormFields.sortOrder)],
          },
          serviceRequirements: {
            orderBy: [
              asc(serviceRequirements.sortOrder),
              asc(serviceRequirements.id),
            ],
          },
        },
      },
    },
    orderBy: [asc(services.sortOrder), asc(services.name)],
  });

  return serializeBigInt(data) ?? [];
}
