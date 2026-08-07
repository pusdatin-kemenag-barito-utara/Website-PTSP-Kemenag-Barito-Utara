import { requireAuth } from "@/lib/auth";
import { fetchAPI } from "@/lib/api";

// Local Components
import { DashboardHero } from "./_components/dashboard-hero";
import { DashboardStats } from "./_components/dashboard-stats";
import { ServiceFlowGuide } from "./_components/service-flow-guide";

export default async function DashboardHomePage() {
  const profile = await requireAuth();

  let requests: any[] = [];
  try {
    const res = await fetchAPI<any>(`/requests?userId=${encodeURIComponent(profile.id)}`);
    if (res && res.data && Array.isArray(res.data)) {
      requests = res.data;
    }
  } catch (err) {
    console.error("Failed to fetch user requests:", err);
  }

  const stats = {
    total: requests.length,
    pending: requests.filter((item) =>
      ["submitted", "under_review"].includes(item.status || ""),
    ).length,
    revision: requests.filter((item) => item.status === "revision_required")
      .length,
    finished: requests.filter((item) =>
      ["approved", "completed", "rejected"].includes(item.status || ""),
    ).length,
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700">
      <DashboardHero fullName={profile.fullName} totalRequests={stats.total} />
      <DashboardStats stats={stats} />
      <ServiceFlowGuide />
    </div>
  );
}
