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
    const rawFullName = (formData.get("full_name") as string) || "";
    const rawPhone = (formData.get("phone") as string) || "";
    const rawAddress = (formData.get("address") as string) || "";
    const rawPassword = (formData.get("password") as string) || "";

    let cleanPhone = rawPhone.replace(/\D/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "62" + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith("62")) {
      cleanPhone = "62" + cleanPhone;
    }

    const validated = UpdateProfileSchema.safeParse({
      fullName: rawFullName.trim(),
      phone: cleanPhone,
      address: rawAddress.trim(),
      password: rawPassword.trim(),
    });

    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const { fullName, phone, address, password } = validated.data;

    // 1. Update nama, no_hp, alamat, dan password ke PostgreSQL Database via Golang REST API
    const updateRes = await UserService.updateProfile(profile.id, {
      fullName,
      phone,
      address,
      password: password || undefined,
      email: profile.email || undefined,
    });

    if (updateRes && (updateRes as any).error && !(updateRes as any).success) {
      return { success: false, error: (updateRes as any).error };
    }

    // 2. Sinkronkan ke Supabase Auth (metadata & password jika diisi)
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const adminClient = createAdminClient();
      const authUpdates: any = {
        user_metadata: {
          full_name: fullName,
          name: fullName,
          phone: phone,
          address: address,
        },
      };
      if (password) {
        authUpdates.password = password;
      }
      await adminClient.auth.admin.updateUserById(profile.id, authUpdates);
    } catch (authSyncErr) {
      console.warn("Supabase Auth admin update warning:", authSyncErr);
    }

    // 3. Fallback update password via user server client jika ada sesi aktif
    if (password) {
      try {
        const supabase = await createClient();
        await supabase.auth.updateUser({ password });
      } catch {}
    }

    revalidatePath("/masyarakat/profil");
    revalidatePath("/masyarakat");
    revalidatePath("/dashboard/profil");
    revalidatePath("/dashboard");
    revalidatePath("/admin/pengguna");

    return { success: true, message: "Profil berhasil diperbarui dan disinkronkan!" };
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return {
      success: false,
      error: error.message || "Gagal memperbarui profil",
    };
  }
}
