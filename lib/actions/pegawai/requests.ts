"use server";

import { db } from "@/lib/db";
import { serviceRequests } from "@/lib/db/schema/requests";
import { services, serviceItems } from "@/lib/db/schema/services";
import { requireAuth } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

export async function getMyRequests() {
  const user = await requireAuth();

  const rows = await db
    .select({
      id: serviceRequests.id,
      requestNumber: serviceRequests.requestNumber,
      status: serviceRequests.status,
      submittedAt: serviceRequests.submittedAt,
      createdAt: serviceRequests.createdAt,
      updatedAt: serviceRequests.updatedAt,
      rejectionReason: serviceRequests.rejectionReason,
      revisionNote: serviceRequests.revisionNote,
      serviceName: services.name,
      serviceItemName: serviceItems.name,
    })
    .from(serviceRequests)
    .leftJoin(services, eq(serviceRequests.serviceId, services.id))
    .leftJoin(serviceItems, eq(serviceRequests.serviceItemId, serviceItems.id))
    .where(eq(serviceRequests.userId, user.id))
    .orderBy(desc(serviceRequests.createdAt));

  return rows;
}
