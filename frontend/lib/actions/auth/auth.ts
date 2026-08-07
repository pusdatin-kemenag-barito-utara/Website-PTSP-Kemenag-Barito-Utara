"use server";

import { isSuperAdmin } from "@/lib/constants";
import { fetchAPI } from "@/lib/api";

export async function getProfileAfterLoginAction(userId: string) {
  if (!userId) return { error: "ID pengguna tidak valid." };

  try {
    const res = await fetchAPI<{ success: boolean; data: any }>(`/admin/users/${userId}`);
    if (res.data) {
      return { data: res.data };
    }
    
    // Fallback jika profile belum ter-sync tapi super_admin
    if (isSuperAdmin(userId)) {
      return { data: { role: "super_admin" as const, isVerified: true } };
    }

    return { error: "Profil tidak ditemukan." };
  } catch (err: any) {
    return { data: { role: "user" as const, isVerified: true } };
  }
}

export async function updatePasswordHashAction(
  userId: string,
  password: string,
) {
  if (!userId || !password) return { error: "Data tidak lengkap." };

  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.updateUserById(userId, { password });
    if (error) throw new Error(error.message);

    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
