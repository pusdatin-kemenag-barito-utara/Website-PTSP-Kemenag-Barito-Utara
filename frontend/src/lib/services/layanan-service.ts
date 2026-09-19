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
   * Get all services with only id and name for dropdowns, filtered by category if provided
   */
  static async getAllServicesBrief(_roleOwner?: string, _category?: string) {
    const res = await fetchAPI<{ success: boolean; data: any[] }>("/services");
    let services = res.data || [];
    if (_category) {
      if (_category === "asn" || _category === "pegawai") {
        services = services.filter((s: any) => s.category === "asn");
      } else if (_category === "public" || _category === "masyarakat") {
        services = services.filter((s: any) => s.category !== "asn");
      }
    }
    return services;
  }
}
