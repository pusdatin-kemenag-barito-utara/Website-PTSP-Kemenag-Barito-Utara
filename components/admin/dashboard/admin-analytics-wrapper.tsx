"use client";

import dynamic from "next/dynamic";

const AdminServiceAnalytics = dynamic(
  () =>
    import(
      "@/components/admin/dashboard/admin-service-analytics"
    ).then((m) => m.AdminServiceAnalytics),
  { ssr: false },
);

const AdminTrendAnalytics = dynamic(
  () =>
    import(
      "@/components/admin/dashboard/admin-trend-analytics"
    ).then((m) => m.AdminTrendAnalytics),
  { ssr: false },
);

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
