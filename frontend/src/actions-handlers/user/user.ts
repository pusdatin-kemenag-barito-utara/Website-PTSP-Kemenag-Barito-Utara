import { revalidatePath } from "@/lib/next-compat/cache";
import { getCurrentProfile } from "@/lib/auth";
import { z } from "zod";
import { UserService } from "@/lib/services/user-service";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = {
  success: boolean;
  message?: string;
  error?: string;
};

const UpdateProfileSchema = z.object({
  fullName: z.string().min(3, "Nama minimal 3 karakter"),
  phone: z.string().min(10, "Nomor WhatsApp tidak valid"),
  address: z.string().min(5, "Alamat minimal 5 karakter"),
  password: z
    .string()
    .min(6, "Password minimal 6 karakter")
    .optional()
    .or(z.literal("")),
});

export async function updateProfileAction(
  formData: FormData,
): Promise<ActionResult> {
  const profile = await getCurrentProfile();
  if (!profile) {
    return {
      success: false,
      error: "Sesi Anda telah berakhir. Silakan login kembali.",
    };
  }

  try {
    const validated = UpdateProfileSchema.safeParse({
      fullName: formData.get("full_name"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      password: formData.get("password"),
    });

    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const { fullName, password } = validated.data;

    // 1. Update nama/profil via REST API Golang Backend
    await UserService.updateProfile(profile.id, {
      fullName,
    });

    // 2. Jika ada password baru, perbarui via Supabase Auth Client
    if (password) {
      const supabase = await createClient();
      const { error: authErr } = await supabase.auth.updateUser({
        password,
      });

      if (authErr) {
        return { success: false, error: authErr.message };
      }
    }

    revalidatePath("/masyarakat/profil");
    revalidatePath("/masyarakat");
    revalidatePath("/dashboard/profil");
    revalidatePath("/dashboard");
    revalidatePath("/admin/pengguna");

    return { success: true, message: "Profil berhasil diperbarui" };
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return {
      success: false,
      error: error.message || "Gagal memperbarui profil",
    };
  }
}
