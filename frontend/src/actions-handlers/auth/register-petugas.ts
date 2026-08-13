import { revalidatePath } from "@/lib/next-compat/cache";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { verifyTurnstileAction } from "@/lib/actions/auth/login-helper";
import { createAuditLog } from "@/lib/audit";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchAPI } from "@/lib/api";

export type ActionResult = {
  success: boolean;
  message?: string;
  error?: string;
};

const RegisterPetugasSchema = z.object({
  fullName: z.string().min(3, "Nama minimal 3 karakter"),
  phone: z.string().min(10, "Nomor WhatsApp tidak valid"),
  unit_kerja: z.string().min(3, "Unit Kerja wajib dipilih"),
  address: z.string().optional(),
  password: z.string().min(8, "Password minimal 8 karakter"),
  role: z.enum([
    "admin_ptsp",
    "admin_sub_bagian_tata_usaha",
    "admin_pendidikan_madrasah",
    "admin_pendidikan_agama_islam",
    "admin_pendidikan_diniyah_pondok_pesantren",
    "admin_bimbingan_masyarakat_islam",
    "admin_bimbingan_masyarakat_kristen_katolik",
    "admin_penyelenggara_zakat_wakaf",
    "admin_penyelenggara_hindu",
    "kepala_kantor",
    "kasubag_tu",
    "super_admin",
  ]),
  permissions: z.array(z.string()).optional(),
});

export async function registerPetugasAction(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const turnstileToken = String(formData.get("turnstile_token") || "");
    const verifyRes = await verifyTurnstileAction(turnstileToken);
    if (!verifyRes.success) {
      return {
        success: false,
        error: "Verifikasi keamanan gagal. Silakan coba lagi.",
      };
    }

    const validated = RegisterPetugasSchema.safeParse({
      fullName: formData.get("full_name"),
      phone: formData.get("phone"),
      unit_kerja: formData.get("unit_kerja"),
      password: formData.get("password"),
      role: formData.get("role"),
      permissions: [],
    });

    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const { fullName, phone, unit_kerja, password, role } = validated.data;
    const admin = createAdminClient();
    const digits = phone.replace(/\D/g, "");
    const internalEmail = `staff_${digits}@ptsp.id`;

    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email: internalEmail,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, phone, address: unit_kerja, role },
    });

    if (authError || !authUser.user) {
      return { success: false, error: authError?.message || "Gagal membuat akun petugas." };
    }

    return {
      success: true,
      message: "Pendaftaran petugas berhasil. Menunggu verifikasi admin.",
    };
  } catch (error: any) {
    console.error("Petugas registration error:", error);
    return {
      success: false,
      error: error.message || "Gagal mendaftarkan petugas",
    };
  }
}

export async function verifyPetugasAction(
  userId: string,
): Promise<ActionResult> {
  const profile = await requirePermission("super_admin");
  try {
    await fetchAPI(`/admin/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ isVerified: true }),
    });

    await createAuditLog({
      adminId: profile.id,
      action: "VERIFIKASI_PETUGAS",
      entityType: "user",
      entityId: userId,
    });

    revalidatePath("/admin/pengguna");
    return { success: true, message: "Akun petugas berhasil diverifikasi" };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal memverifikasi petugas",
    };
  }
}

export async function rejectPetugasAction(
  userId: string,
): Promise<ActionResult> {
  const profile = await requirePermission("super_admin");
  try {
    await fetchAPI(`/admin/users/${userId}`, {
      method: "DELETE",
    });

    await createAuditLog({
      adminId: profile.id,
      action: "TOLAK_PETUGAS",
      entityType: "user",
      entityId: userId,
    });

    revalidatePath("/admin/pengguna");
    return {
      success: true,
      message: "Pendaftaran petugas ditolak dan akun dihapus",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal menolak pendaftaran",
    };
  }
}

export async function updatePetugasAction(data: any): Promise<ActionResult> {
  const profile = await requirePermission("super_admin");
  try {
    const { userId, role, phone, unitKerja, newPassword } = data;

    if (newPassword) {
      const admin = createAdminClient();
      await admin.auth.admin.updateUserById(userId, { password: newPassword });
    }

    await fetchAPI(`/admin/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });

    await fetchAPI(`/admin/profile/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ full_name: data.fullName }),
    });

    await createAuditLog({
      adminId: profile.id,
      action: "UBAH_DATA_PETUGAS",
      entityType: "user",
      entityId: userId,
      details: { role, phone, unitKerja },
    });

    revalidatePath("/admin/pengguna");
    return { success: true, message: "Data petugas berhasil diperbarui" };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal memperbarui data petugas",
    };
  }
}
