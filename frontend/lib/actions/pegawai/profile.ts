"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { fetchAPI } from "@/lib/api";

export async function updatePegawaiAvatar(formData: FormData) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const file = formData.get("avatar") as File;
    if (!file) {
      return { success: false, error: "Tidak ada file yang diunggah" };
    }

    if (file.size > 2 * 1024 * 1024) {
      return { success: false, error: "Ukuran file maksimal 2MB" };
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const bucketName = "avatars";

    const adminSupabase = createAdminClient();

    const { error: uploadError } = await adminSupabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Avatar upload error:", uploadError);
      return { success: false, error: "Gagal mengunggah avatar" };
    }

    const {
      data: { publicUrl },
    } = adminSupabase.storage.from(bucketName).getPublicUrl(fileName);

    await fetchAPI(`/admin/profile/${user.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        avatar_url: publicUrl,
      }),
    });

    revalidatePath("/pegawai/profil");
    revalidatePath("/admin/kepegawaian/data");

    return { success: true, avatarUrl: publicUrl };
  } catch (error: any) {
    console.error("Error updating avatar:", error);
    return {
      success: false,
      error: error.message || "Terjadi kesalahan internal",
    };
  }
}

export async function updatePegawaiPassword(formData: FormData) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const newPassword = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!newPassword || newPassword.length < 8) {
      return { success: false, error: "Password minimal 8 karakter" };
    }

    if (newPassword !== confirmPassword) {
      return { success: false, error: "Konfirmasi password tidak cocok" };
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error("Update password error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, message: "Password berhasil diperbarui" };
  } catch (error: any) {
    console.error("Error updating password:", error);
    return {
      success: false,
      error: error.message || "Terjadi kesalahan internal",
    };
  }
}
