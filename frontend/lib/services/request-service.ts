import { fetchAPI } from "@/lib/api";

export class RequestService {
  static async getPaginatedRequests(params: { page: number; pageSize: number; status?: string }) {
    const statusQuery = params.status ? `?status=${params.status}` : "";
    const res = await fetchAPI<{ success: boolean; data: any[] }>(`/admin/requests${statusQuery}`);
    const data = res.data || [];
    return {
      data,
      totalCount: data.length,
      totalPages: Math.ceil(data.length / (params.pageSize || 10)),
    };
  }

  static async searchGlobal(query: string) {
    if (!query || query.length < 2) return { requests: [], profiles: [] };
    const res = await fetchAPI<any>(`/admin/search?q=${encodeURIComponent(query)}`);
    return {
      requests: res.data?.requests || res.requests || [],
      profiles: res.data?.profiles || res.profiles || [],
    };
  }

  static async updateStatus(params: { requestId: string; status: string; rejectionReason?: string; revisionNote?: string }) {
    return await fetchAPI(`/admin/requests/${params.requestId}/status`, {
      method: "PATCH",
      body: JSON.stringify({
        status: params.status,
        rejectionReason: params.rejectionReason,
        revisionNote: params.revisionNote,
      }),
    });
  }

  static async deleteRequest(requestId: string) {
    return await fetchAPI(`/admin/requests/${requestId}`, {
      method: "DELETE",
    });
  }

  static async createByApplicant(params: any) {
    return await fetchAPI("/requests", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  static async updateByApplicant(params: any) {
    return await fetchAPI(`/requests/${params.requestId}`, {
      method: "PUT",
      body: JSON.stringify(params),
    });
  }

  static async deleteByApplicant(requestId: string) {
    return await fetchAPI(`/requests/${requestId}`, {
      method: "DELETE",
    });
  }
}
