import { isSuperAdmin } from "@/lib/constants";
import { fetchAPI } from "@/lib/api";

export async function getProfileAfterLoginAction(userId: string) {
  if (!userId) return { error: "ID pengguna tidak valid." };

  try {
    const res = await fetchAPI<{ success: boolean; data: any }>(`/users/${userId}`);
    if (res && res.data) {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const admin = createAdminClient();
      const { data: authUserData } = await admin.auth.admin.getUserById(userId);
      const email = res.data.email || authUserData?.user?.email || "";
      const isSuper = isSuperAdmin(email);
      const role = isSuper ? "super_admin" : (res.data.role && res.data.role !== "user" ? res.data.role : (authUserData?.user?.user_metadata?.role || res.data.role || "user"));
      return {
        data: {
          ...res.data,
          email,
          role,
          isVerified: isSuper ? true : (res.data.isVerified ?? true),
        }
      };
    }
    
    // Check if user is super admin by checking email
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    const { data: authUserData } = await admin.auth.admin.getUserById(userId);
    const email = authUserData?.user?.email || "";

    if (email && isSuperAdmin(email)) {
      return { data: { id: userId, email, role: "super_admin" as const, isVerified: true } };
    }

    const metadataRole = authUserData?.user?.user_metadata?.role || "user";
    return { data: { id: userId, email, role: metadataRole, isVerified: true } };
  } catch (err: any) {
    return { data: { id: userId, role: "user" as const, isVerified: true } };
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
