import { fetchAPI } from "@/lib/api";

export class LayananService {
  static async createService(data: any) {
    return await fetchAPI("/admin/services", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async updateService(id: bigint | string, data: any) {
    return await fetchAPI(`/admin/services/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  static async deleteService(id: bigint | string) {
    return await fetchAPI(`/admin/services/${id}`, {
      method: "DELETE",
    });
  }

  static async reorderServices(_ids: (bigint | string)[]) {
    // Reorder handled in Golang backend
  }

  /**
   * Get all services with only id and name for dropdowns
   */
  static async getAllServicesBrief(_roleOwner?: string, _category?: string) {
    const res = await fetchAPI<{ success: boolean; data: any[] }>("/services");
    return res.data || [];
  }
}
