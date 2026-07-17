import { db, serializeBigInt } from "@/lib/db";
import {
  services,
  serviceItems,
  serviceRequirements,
  serviceFormFields,
} from "@/lib/db/schema";
import { eq, asc, and, sql } from "drizzle-orm";

export async function getHomeVideos() {
  try {
    const data = await db.execute(sql`
      SELECT id, title, youtube_id as "youtubeId", created_at as "createdAt"
      FROM kemenag_website.youtube_videos 
      WHERE is_published = true 
      ORDER BY sort_order ASC 
      LIMIT 6
    `);
    
    const countData = await db.execute(sql`
      SELECT COUNT(*) as count 
      FROM kemenag_website.youtube_videos 
      WHERE is_published = true
    `);
    
    return {
      videos: data.rows as { id: string; title: string; youtubeId: string; createdAt: string }[],
      totalCount: Number(countData.rows[0]?.count || 0)
    };
  } catch (error) {
    console.error("Error fetching home videos:", error);
    return { videos: [], totalCount: 0 };
  }
}

export async function getPublicServices() {
  const data = await db.query.services.findMany({
    where: and(eq(services.isActive, true), eq(services.category, "public")),
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

export async function getEmployeeServices() {
  const data = await db.query.services.findMany({
    where: and(eq(services.isActive, true), eq(services.category, "asn")),
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
