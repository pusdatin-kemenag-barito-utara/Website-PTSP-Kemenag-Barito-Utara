import prisma from "@/lib/prisma";

/**
 * Helper to convert BigInt values to numbers/strings for JSON serialization
 */
function serializeBigInt(obj: any): any {
  return JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

export async function getPublicServices() {
  const data = await prisma.services.findMany({
    where: { is_active: true },
    include: {
      service_items: {
        // @ts-ignore
        orderBy: [
          // @ts-ignore
          { sort_order: "asc" },
          { name: "asc" }
        ],
        include: {
          service_requirements: {
            // @ts-ignore
            orderBy: [
              // @ts-ignore
              { sort_order: "asc" },
              { id: "asc" }
            ],
          },
        },
      },
    },
    // @ts-ignore
    orderBy: [
      // @ts-ignore
      { sort_order: "asc" },
      { name: "asc" }
    ],
  });

  return serializeBigInt(data) ?? [];
}

export async function getServiceBySlug(slug: string) {
  const data = await prisma.services.findFirst({
    where: { slug },
    include: {
      service_items: {
        // @ts-ignore
        orderBy: [
          // @ts-ignore
          { sort_order: "asc" },
          { name: "asc" }
        ],
        include: {
          service_form_fields: {
            orderBy: { sort_order: "asc" },
          },
          service_requirements: {
            // @ts-ignore
            orderBy: [
              // @ts-ignore
              { sort_order: "asc" },
              { id: "asc" }
            ],
          },
        },
      },
    },
  });

  return serializeBigInt(data);
}

export async function getServiceCatalog() {
  const data = await prisma.services.findMany({
    where: { is_active: true },
    include: {
      service_items: {
        // @ts-ignore
        orderBy: [
          // @ts-ignore
          { sort_order: "asc" },
          { name: "asc" }
        ],
        include: {
          service_form_fields: {
            orderBy: { sort_order: "asc" },
          },
          service_requirements: {
            // @ts-ignore
            orderBy: [
              // @ts-ignore
              { sort_order: "asc" },
              { id: "asc" }
            ],
          },
        },
      },
    },
    // @ts-ignore
    orderBy: [
      // @ts-ignore
      { sort_order: "asc" },
      { name: "asc" }
    ],
  });

  return serializeBigInt(data) ?? [];
}
