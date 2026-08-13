import { fetchAPI } from "@/lib/api";

export async function getAdminDashboardStats(roleOwner?: string) {
  try {
    const query = roleOwner ? `?roleOwner=${encodeURIComponent(roleOwner)}` : "";
    const res = await fetchAPI<{ success: boolean; data: any }>(`/admin/stats${query}`);
    const data = res.data || {};

    const emptyCategoryStats = {
      serviceCount: 0,
      userCount: 0,
      totalRequests: 0,
      needAction: 0,
      stats: { submitted: 0, underReview: 0, revision: 0, finished: 0 },
    };

    const masyarakatStats = data.masyarakat
      ? {
          serviceCount: Number(data.masyarakat.serviceCount) || 0,
          userCount: Number(data.masyarakat.userCount) || 0,
          totalRequests: Number(data.masyarakat.totalRequests) || 0,
          needAction: Number(data.masyarakat.needAction) || 0,
          stats: {
            submitted: Number(data.masyarakat.stats?.submitted) || 0,
            underReview: Number(data.masyarakat.stats?.underReview) || 0,
            revision: Number(data.masyarakat.stats?.revision) || 0,
            finished: Number(data.masyarakat.stats?.finished) || 0,
          },
        }
      : emptyCategoryStats;

    const pegawaiStats = data.pegawai
      ? {
          serviceCount: Number(data.pegawai.serviceCount) || 0,
          userCount: Number(data.pegawai.userCount) || 0,
          totalRequests: Number(data.pegawai.totalRequests) || 0,
          needAction: Number(data.pegawai.needAction) || 0,
          stats: {
            submitted: Number(data.pegawai.stats?.submitted) || 0,
            underReview: Number(data.pegawai.stats?.underReview) || 0,
            revision: Number(data.pegawai.stats?.revision) || 0,
            finished: Number(data.pegawai.stats?.finished) || 0,
          },
        }
      : emptyCategoryStats;

    return { masyarakat: masyarakatStats, pegawai: pegawaiStats };
  } catch (error) {
    console.error("Error fetching admin dashboard stats from Golang API:", error);
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
  try {
    const query = roleOwner ? `?roleOwner=${encodeURIComponent(roleOwner)}` : "";
    const res = await fetchAPI<{ success: boolean; data: any }>(`/admin/stats${query}`);
    return {
      serviceAnalytics: res.data?.serviceAnalytics || [],
      trendAnalytics: res.data?.trendAnalytics || [],
    };
  } catch (error) {
    return {
      serviceAnalytics: [],
      trendAnalytics: [],
    };
  }
}
