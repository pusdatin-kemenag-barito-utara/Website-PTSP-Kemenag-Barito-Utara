import { AdminServiceAnalytics } from "@/components/admin/dashboard/admin-service-analytics";
import { AdminTrendAnalytics } from "@/components/admin/dashboard/admin-trend-analytics";

export function AdminAnalyticsWrapper({
  serviceAnalytics,
  trendAnalytics,
}: {
  serviceAnalytics: any[];
  trendAnalytics: any[];
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <AdminServiceAnalytics data={serviceAnalytics} />
      <AdminTrendAnalytics data={trendAnalytics} />
    </div>
  );
}
