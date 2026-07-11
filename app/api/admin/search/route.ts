import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db, serializeBigInt } from "@/lib/db";
import {
  serviceRequests as serviceRequestsTable,
  profiles as profilesTable,
  services as servicesTable,
  serviceItems as serviceItemsTable,
  auditLogs as auditLogsTable,
  generatedDocuments as generatedDocumentsTable,
} from "@/lib/db/schema";
import { or, ilike, desc, eq, sql } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

    if (!q || q.length < 2) {
      return NextResponse.json({ requests: [], profiles: [], services: [], auditLogs: [] });
    }

    const searchStr = `%${q}%`;

    // 1. Search Requests (by number, status, or linked profile name)
    const requests = await db
      .select({
        id: serviceRequestsTable.id,
        requestNumber: serviceRequestsTable.requestNumber,
        status: serviceRequestsTable.status,
        createdAt: serviceRequestsTable.createdAt,
        serviceName: servicesTable.name,
        applicantName: profilesTable.fullName,
      })
      .from(serviceRequestsTable)
      .leftJoin(servicesTable, eq(serviceRequestsTable.serviceId, servicesTable.id))
      .leftJoin(profilesTable, eq(serviceRequestsTable.userId, profilesTable.id))
      .where(
        or(
          ilike(serviceRequestsTable.requestNumber, searchStr),
          ilike(servicesTable.name, searchStr),
          ilike(profilesTable.fullName, searchStr),
        )
      )
      .orderBy(desc(serviceRequestsTable.createdAt))
      .limit(6);

    // 2. Search Profiles (users, admins, staff)
    const profiles = await db
      .select({
        id: profilesTable.id,
        fullName: profilesTable.fullName,
        email: profilesTable.email,
        role: profilesTable.role,
        phone: profilesTable.phone,
      })
      .from(profilesTable)
      .where(
        or(
          ilike(profilesTable.fullName, searchStr),
          ilike(profilesTable.email, searchStr),
          ilike(profilesTable.phone, searchStr),
        )
      )
      .limit(5);

    // 3. Search Services (layanan)
    const services = await db
      .select({
        id: servicesTable.id,
        name: servicesTable.name,
        slug: servicesTable.slug,
      })
      .from(servicesTable)
      .where(
        or(
          ilike(servicesTable.name, searchStr),
          ilike(servicesTable.slug, searchStr),
        )
      )
      .limit(5);

    // 4. Search Audit Logs
    const auditLogs = await db
      .select({
        id: auditLogsTable.id,
        action: auditLogsTable.action,
        entityType: auditLogsTable.target,
        createdAt: auditLogsTable.timestamp,
        adminName: profilesTable.fullName,
      })
      .from(auditLogsTable)
      .leftJoin(profilesTable, eq(auditLogsTable.performedBy, profilesTable.id))
      .where(
        or(
          ilike(auditLogsTable.action, searchStr),
          ilike(auditLogsTable.target, searchStr),
          ilike(profilesTable.fullName, searchStr),
        )
      )
      .orderBy(desc(auditLogsTable.timestamp))
      .limit(5);

    return NextResponse.json(serializeBigInt({ requests, profiles, services, auditLogs }));
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
