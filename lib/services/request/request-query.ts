import { db } from "@/lib/db";
import {
  serviceRequests,
  profiles as profilesTable,
  services as servicesTable,
} from "@/lib/db/schema";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";

export class RequestQueryService {
  /**
   * Get paginated requests for Admin view
   */
  static async getPaginatedRequests(params: {
    page: number;
    pageSize: number;
    status?: string;
    q?: string;
    serviceId?: string;
    roleOwner?: string;
    category?: string;
  }) {
    const { page, pageSize, status, q, serviceId, roleOwner, category } = params;
    const offset = (page - 1) * pageSize;

    const filters = [];
    if (status) filters.push(eq(serviceRequests.status, status as any));
    if (serviceId) filters.push(eq(serviceRequests.serviceId, BigInt(serviceId)));
    if (roleOwner) {
      filters.push(
        sql`EXISTS (SELECT 1 FROM kemenag_ptsp.ptsp_services WHERE kemenag_ptsp.ptsp_services.id = ${serviceRequests.serviceId} AND kemenag_ptsp.ptsp_services.role_owner = ${roleOwner})`
      );
    }
    if (category) {
      filters.push(
        sql`EXISTS (SELECT 1 FROM kemenag_ptsp.ptsp_services WHERE kemenag_ptsp.ptsp_services.id = ${serviceRequests.serviceId} AND kemenag_ptsp.ptsp_services.category = ${category})`
      );
    }
    if (q) {
      filters.push(
        or(
          ilike(serviceRequests.requestNumber, `%${q}%`),
          sql`EXISTS (SELECT 1 FROM ${profilesTable} WHERE ${profilesTable.id} = ${serviceRequests.userId} AND (${ilike(profilesTable.fullName, `%${q}%`)} OR ${ilike(profilesTable.email, `%${q}%`)}))`
        )
      );
    }

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const [data, [{ count }]] = await Promise.all([
      db.query.serviceRequests.findMany({
        where: whereClause,
        with: {
          profiles: { columns: { fullName: true, email: true } },
          services: { columns: { name: true } },
          serviceItems: { columns: { name: true } },
        },
        orderBy: [desc(serviceRequests.createdAt)],
        limit: pageSize,
        offset: offset,
      }),
      db.select({ count: sql<number>`count(*)` }).from(serviceRequests).where(whereClause),
    ]);

    return {
      data,
      totalCount: Number(count),
      totalPages: Math.ceil(Number(count) / pageSize),
    };
  }

  /**
   * Global search for Command Palette
   */
  static async searchGlobal(query: string) {
    if (!query || query.length < 2) return { requests: [], profiles: [] };

    const searchStr = `%${query}%`;

    // 1. Search Requests
    const requests = await db
      .select({
        id: serviceRequests.id,
        requestNumber: serviceRequests.requestNumber,
        status: serviceRequests.status,
        serviceName: servicesTable.name,
      })
      .from(serviceRequests)
      .leftJoin(servicesTable, eq(serviceRequests.serviceId, servicesTable.id))
      .where(
        or(
          ilike(serviceRequests.requestNumber, searchStr),
          ilike(servicesTable.name, searchStr)
        )
      )
      .limit(5);

    // 2. Search Profiles
    const profiles = await db
      .select({
        id: profilesTable.id,
        fullName: profilesTable.fullName,
        email: profilesTable.email,
        role: profilesTable.role,
      })
      .from(profilesTable)
      .where(
        or(
          ilike(profilesTable.fullName, searchStr),
          ilike(profilesTable.email, searchStr)
        )
      )
      .limit(5);

    return { requests, profiles };
  }
}
