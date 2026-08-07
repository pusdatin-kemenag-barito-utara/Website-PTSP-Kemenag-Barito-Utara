import { fetchAPI } from "@/lib/api";

export class AdminService {
  /**
   * Update user role
   */
  static async updateRole(id: string, role: any) {
    return await fetchAPI(`/admin/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
  }

  /**
   * Update user permissions
   */
  static async updatePermissions(userId: string, _permissions: string[]) {
    return await fetchAPI(`/admin/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ permissions: _permissions }),
    });
  }

  /**
   * Delete user permanently
   */
  static async deleteUserPermanently(userId: string) {
    return await fetchAPI(`/admin/users/${userId}`, {
      method: "DELETE",
    });
  }

  /**
   * Verify staff account
   */
  static async verifyStaff(userId: string) {
    return await fetchAPI(`/admin/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ isVerified: true }),
    });
  }

  /**
   * Reject staff account
   */
  static async rejectStaff(userId: string) {
    return await fetchAPI(`/admin/users/${userId}`, {
      method: "DELETE",
    });
  }
}
