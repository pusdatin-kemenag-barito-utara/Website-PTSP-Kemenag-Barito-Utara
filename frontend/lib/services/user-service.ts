import { fetchAPI } from "@/lib/api";

export class UserService {
  /**
   * Update user self-profile via Golang API
   */
  static async updateProfile(userId: string, data: { fullName?: string; avatarUrl?: string }) {
    return await fetchAPI(`/admin/profile/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({
        full_name: data.fullName,
        avatar_url: data.avatarUrl,
      }),
    });
  }
}
