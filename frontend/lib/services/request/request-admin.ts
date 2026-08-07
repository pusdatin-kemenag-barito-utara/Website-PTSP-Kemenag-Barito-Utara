import { fetchAPI } from "@/lib/api";

export class RequestAdminService {
  /**
   * Update status permohonan via REST API Golang Backend
   */
  static async updateStatus(
    requestId: string,
    newStatus: string,
    notes: string,
    _adminId: string,
  ) {
    return await fetchAPI(`/admin/requests/${requestId}`, {
      method: "PATCH",
      body: JSON.stringify({
        status: newStatus,
        notes: notes || undefined,
      }),
    });
  }

  /**
   * Delete request via REST API Golang Backend
   */
  static async deletePermanently(requestId: string, _adminId: string) {
    return await fetchAPI(`/admin/requests/${requestId}`, {
      method: "DELETE",
    });
  }
}
