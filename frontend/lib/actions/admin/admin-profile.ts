"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth";
import { fetchAPI } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSuperAdmin } from "@/lib/constants";

export type ActionResult = {
  success: boolean;
  message?: string;
  error?: string;
  avatarUrl?: string;
};

const UPLOAD_ALLOWED_ROLES = ["super_admin", "admin_ptsp", "kepala_kantor", "kasubag_tu"];

export async function updateAvatarUrlAction(avatarUrl: string): Promise<ActionResult> {
  const profile = await getCurrentProfile();
  if (!profile) {
    return { success: false, error: "Sesi Anda telah berakhir." };
  }

  try {
    await fetchAPI(`/admin/profile/${profile.id}`, {
      method: "PATCH",
      body: JSON.stringify({ avatar_url: avatarUrl }),
    });

    revalidatePath("/admin");
    revalidatePath("/admin/profil");
    return { success: true, message: "Foto profil berhasil diperbarui" };
  } catch (error: any) {
    console.error("Error updating avatar:", error);
    return { success: false, error: error.message || "Gagal memperbarui foto profil" };
  }
}

export async function uploadAvatarAction(
  base64Image: string,
  fileName: string,
): Promise<ActionResult> {
  const profile = await getCurrentProfile();
  if (!profile) {
    return { success: false, error: "Sesi Anda telah berakhir." };
  }

  if (!isSuperAdmin(profile.email) && !UPLOAD_ALLOWED_ROLES.includes(profile.role)) {
    return { success: false, error: "Anda tidak memiliki izin untuk mengubah foto profil." };
  }

  try {
    const res = await fetchAPI<any>(`/admin/profile/${profile.id}`, {
      method: "PATCH",
      body: JSON.stringify({ base64_image: base64Image }),
    });

    const newAvatarUrl = res?.avatar_url || res?.data?.avatar_url;

    revalidatePath("/admin");
    return { success: true, avatarUrl: newAvatarUrl, message: "Foto profil berhasil diperbarui" };
  } catch (error: any) {
    console.error("Error uploading avatar:", error);
    return { success: false, error: error.message || "Gagal mengupload foto profil" };
  }
}

export async function updateProfileNameAction(fullName: string): Promise<ActionResult> {
  const profile = await getCurrentProfile();
  if (!profile) {
    return { success: false, error: "Sesi Anda telah berakhir." };
  }

  const trimmed = fullName.trim();
  if (!trimmed) {
    return { success: false, error: "Nama tidak boleh kosong." };
  }
  if (trimmed.length > 100) {
    return { success: false, error: "Nama maksimal 100 karakter." };
  }

  try {
    await fetchAPI(`/admin/profile/${profile.id}`, {
      method: "PATCH",
      body: JSON.stringify({ full_name: trimmed }),
    });

    revalidatePath("/admin");
    return { success: true, message: "Nama berhasil diperbarui" };
  } catch (error: any) {
    console.error("Error updating name:", error);
    return { success: false, error: error.message || "Gagal memperbarui nama" };
  }
}

export async function updateAdminPasswordAction(password: string): Promise<ActionResult> {
  const profile = await getCurrentProfile();
  if (!profile) {
    return { success: false, error: "Sesi Anda telah berakhir." };
  }

  if (password.length < 8) {
    return { success: false, error: "Password minimal 8 karakter" };
  }

  try {
    const admin = createAdminClient();
    const { error: authError } = await admin.auth.admin.updateUserById(profile.id, {
      password,
    });
    if (authError) throw new Error(authError.message);

    return { success: true, message: "Password berhasil diperbarui" };
  } catch (error: any) {
    console.error("Error updating password:", error);
    return { success: false, error: error.message || "Gagal memperbarui password" };
  }
}
