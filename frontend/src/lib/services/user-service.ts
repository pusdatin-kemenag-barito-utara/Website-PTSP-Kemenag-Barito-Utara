import { fetchAPI } from "@/lib/api";

export interface UpdateProfilePayload {
  name?: string;
  fullName?: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
  password?: string;
  email?: string;
}

export class UserService {
  /**
   * Update user self-profile via Golang API
   */
  static async updateProfile(userId: string, data: UpdateProfilePayload) {
    const payload = {
      name: data.fullName || data.name,
      full_name: data.fullName || data.name,
      phone: data.phone,
      address: data.address,
      avatar_url: data.avatarUrl,
      password: data.password,
      email: data.email,
    };

    // 1. Coba via endpoint publik /users/:id/profile (dapat diakses pemohon/pegawai tanpa token admin)
    const res = await fetchAPI<{ success?: boolean; message?: string; error?: string }>(
      `/users/${userId}/profile`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    );

    if (res?.success) {
      return res;
    }

    // 2. Fallback ke /admin/profile/:id jika endpoint publik tidak merespons
    return await fetchAPI<{ success?: boolean; message?: string; error?: string }>(
      `/admin/profile/${userId}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    );
  }
}
