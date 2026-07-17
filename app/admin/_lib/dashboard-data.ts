import { db } from "@/lib/db";
import { services, profiles, serviceRequests, serviceItems } from "@/lib/db/schema";
import { count, desc, gte, inArray, sql, and, eq } from "drizzle-orm";

import { profilesPemohon, profilesPegawai } from "@/lib/db/schema/auth";

export async function getAdminDashboardStats(roleOwner?: string) {
  const baseServiceWhere = roleOwner
    ? eq(services.roleOwner, roleOwner as any)
    : undefined;

  const publicServiceWhere = baseServiceWhere
    ? and(baseServiceWhere, eq(services.category, "public"))
    : eq(services.category, "public");

  const asnServiceWhere = baseServiceWhere
    ? and(baseServiceWhere, eq(services.category, "asn"))
    : eq(services.category, "asn");

  const publicRequestWhere = roleOwner
    ? sql`EXISTS (SELECT 1 FROM ${services} WHERE ${services.id} = ${serviceRequests.serviceId} AND ${services.roleOwner} = ${roleOwner} AND ${services.category} = 'public')`
    : sql`EXISTS (SELECT 1 FROM ${services} WHERE ${services.id} = ${serviceRequests.serviceId} AND ${services.category} = 'public')`;

  const asnRequestWhere = roleOwner
    ? sql`EXISTS (SELECT 1 FROM ${services} WHERE ${services.id} = ${serviceRequests.serviceId} AND ${services.roleOwner} = ${roleOwner} AND ${services.category} = 'asn')`
    : sql`EXISTS (SELECT 1 FROM ${services} WHERE ${services.id} = ${serviceRequests.serviceId} AND ${services.category} = 'asn')`;

  try {
    const [
      publicServicesCount,
      asnServicesCount,
      pemohonUsersCount,
      pegawaiUsersCount,
      publicStatusCounts,
      asnStatusCounts,
    ] = await Promise.all([
      db.select({ value: count() })
        .from(serviceItems)
        .innerJoin(services, eq(serviceItems.serviceId, services.id))
        .where(publicServiceWhere),
      db.select({ value: count() }).from(services).where(asnServiceWhere),
      db.select({ value: count() }).from(profilesPemohon),
      db.select({ value: count() }).from(profilesPegawai),
      db
        .select({ status: serviceRequests.status, count: count() })
        .from(serviceRequests)
        .where(publicRequestWhere)
        .groupBy(serviceRequests.status),
      db
        .select({ status: serviceRequests.status, count: count() })
        .from(serviceRequests)
        .where(asnRequestWhere)
        .groupBy(serviceRequests.status),
    ]);

    const parseStats = (statusCounts: any[]) => {
      const stats = {
        submitted: Number(
          statusCounts.find((s) => s.status === "submitted")?.count || 0,
        ),
        underReview: Number(
          statusCounts.find((s) => s.status === "under_review")?.count || 0,
        ),
        revision: Number(
          statusCounts.find((s) => s.status === "revision_required")?.count ||
            0,
        ),
        finished: statusCounts
          .filter((s) => ["approved", "completed"].includes(s.status || ""))
          .reduce((acc, curr) => acc + Number(curr.count), 0),
      };
      const totalRequests = statusCounts.reduce(
        (acc, curr) => acc + Number(curr.count),
        0,
      );
      const needAction = stats.submitted + stats.underReview;
      return { stats, totalRequests, needAction };
    };

    const masyarakat = {
      serviceCount: Number(publicServicesCount[0].value),
      userCount: Number(pemohonUsersCount[0].value),
      ...parseStats(publicStatusCounts),
    };

    const pegawai = {
      serviceCount: Number(asnServicesCount[0].value),
      userCount: Number(pegawaiUsersCount[0].value),
      ...parseStats(asnStatusCounts),
    };

    return { masyarakat, pegawai };
  } catch (error) {
    console.error("getAdminDashboardStats failed:", error);
    const emptyStats = {
      serviceCount: 0,
      userCount: 0,
      stats: { submitted: 0, underReview: 0, revision: 0, finished: 0 },
      totalRequests: 0,
      needAction: 0,
    };
    return { masyarakat: emptyStats, pegawai: emptyStats };
  }
}

export async function getAdminDashboardAnalytics(roleOwner?: string) {
  const requestWhere = roleOwner
    ? sql`EXISTS (SELECT 1 FROM ${services} WHERE ${services.id} = ${serviceRequests.serviceId} AND ${services.roleOwner} = ${roleOwner})`
    : undefined;

  // 1. Top Services
  const topServicesRaw = await db
    .select({
      serviceId: serviceRequests.serviceId,
      count: count(serviceRequests.id),
    })
    .from(serviceRequests)
    .where(requestWhere)
    .groupBy(serviceRequests.serviceId)
    .orderBy(desc(count(serviceRequests.id)))
    .limit(5);

  const serviceIds = topServicesRaw
    .map((s) => s.serviceId)
    .filter((id): id is bigint => id !== null);

  let serviceAnalytics: { name: string; count: number }[] = [];
  if (serviceIds.length > 0) {
    const servicesInfo = await db
      .select({ id: services.id, name: services.name })
      .from(services)
      .where(inArray(services.id, serviceIds));

    serviceAnalytics = topServicesRaw.map((s) => {
      const info = servicesInfo.find((si) => si.id === s.serviceId);
      return {
        name: info?.name || "Lainnya",
        count: Number(s.count),
      };
    });
  }

  // 2. Trend Data (7 Days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setHours(0, 0, 0, 0);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const trendFilters = [gte(serviceRequests.createdAt, sevenDaysAgo)];
  if (roleOwner) {
    trendFilters.push(
      sql`EXISTS (SELECT 1 FROM ${services} WHERE ${services.id} = ${serviceRequests.serviceId} AND ${services.roleOwner} = ${roleOwner})`,
    );
  }

  const trendResults = await db
    .select({
      date: sql<string>`date_trunc('day', ${serviceRequests.createdAt})::date`,
      count: count(),
    })
    .from(serviceRequests)
    .where(and(...trendFilters))
    .groupBy(sql`date_trunc('day', ${serviceRequests.createdAt})::date`)
    .orderBy(sql`date_trunc('day', ${serviceRequests.createdAt})::date`);

  const trendAnalytics = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
    });

    const dbResult = trendResults.find((r) => String(r.date) === dateStr);

    trendAnalytics.push({
      date: label,
      count: dbResult ? Number(dbResult.count) : 0,
    });
  }

  return { serviceAnalytics, trendAnalytics };
}
