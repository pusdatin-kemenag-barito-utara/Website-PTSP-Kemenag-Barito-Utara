import { fetchAPI } from "@/lib/api";

export class RequestQueryService {
  /**
   * Get paginated requests for Admin view
   */
  static async getPaginatedRequests(params: {
    page: number;
    pageSize: number;
    status?: string;
  }) {
    const statusQuery = params.status ? `?status=${params.status}` : "";
    const res = await fetchAPI<{ success: boolean; data: any[] }>(`/admin/requests${statusQuery}`);
    const data = res.data || [];
    return {
      data,
      totalCount: data.length,
      totalPages: Math.ceil(data.length / (params.pageSize || 10)),
    };
  }

  /**
   * Global search for Command Palette
   */
  static async searchGlobal(query: string) {
    if (!query || query.length < 2) return { requests: [], profiles: [] };
    const res = await fetchAPI<any>(`/admin/search?q=${encodeURIComponent(query)}`);
    return {
      requests: res.data?.requests || res.requests || [],
      profiles: res.data?.profiles || res.profiles || [],
    };
  }
}
