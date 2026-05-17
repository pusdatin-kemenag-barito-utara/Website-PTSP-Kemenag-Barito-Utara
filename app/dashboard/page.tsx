import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { serviceRequests } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Local Components
import { DashboardHero } from "./_components/dashboard-hero";
import { DashboardStats } from "./_components/dashboard-stats";
import { DashboardActions } from "./_components/dashboard-actions";

export default async function DashboardHomePage() {
  const profile = await requireAuth();

  const requests = await db
    .select({ status: serviceRequests.status })
    .from(serviceRequests)
    .where(eq(serviceRequests.userId, profile.id));

  const stats = {
    total: requests.length,
    pending: requests.filter((item) =>
      ["submitted", "under_review"].includes(item.status || ""),
    ).length,
    revision: requests.filter((item) => item.status === "revision_required")
      .length,
    finished: requests.filter((item) =>
      ["approved", "completed"].includes(item.status || ""),
    ).length,
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700">
      <DashboardHero fullName={profile.fullName} totalRequests={stats.total} />
      <DashboardStats stats={stats} />
      <DashboardActions />
    </div>
  );
}
