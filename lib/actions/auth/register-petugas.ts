"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { AuthService } from "@/lib/services/auth-service";
import { AdminService } from "@/lib/services/admin-service";
import { verifyTurnstileAction } from "@/lib/actions/auth/login-helper";
import { UserService } from "@/lib/services/user-service";

export type ActionResult = {
  success: boolean;
  message?: string;
  error?: string;
};

const RegisterPetugasSchema = z.object({
  fullName: z.string().min(3, "Nama minimal 3 karakter"),
  phone: z.string().min(10, "Nomor WhatsApp tidak valid"),
  address: z.string().min(5, "Alamat minimal 5 karakter"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  role: z.enum(["admin_ptsp", "kepala_kantor", "kasubag_tu", "super_admin"]),
  permissions: z.array(z.string()).optional(),
});

export async function registerPetugasAction(formData: FormData): Promise<ActionResult> {
  try {
    const turnstileToken = String(formData.get("turnstile_token") || "");
    const verifyRes = await verifyTurnstileAction(turnstileToken);
    if (!verifyRes.success) {
      return { success: false, error: "Verifikasi keamanan gagal. Silakan coba lagi." };
    }

    const validated = RegisterPetugasSchema.safeParse({
      fullName: formData.get("full_name"),
      phone: formData.get("phone"),
      address: formData.get("unit_kerja") || formData.get("address"), // Using unit_kerja as address for staff
      password: formData.get("password"),
      role: formData.get("role"),
      permissions: [],
    });

    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    await AuthService.registerPetugas(validated.data);

    return { success: true, message: "Pendaftaran petugas berhasil. Menunggu verifikasi admin." };
  } catch (error: any) {
    console.error("Petugas registration error:", error);
    return { success: false, error: error.message || "Gagal mendaftarkan petugas" };
  }
}

export async function verifyPetugasAction(userId: string): Promise<ActionResult> {
  try {
    await requirePermission("super_admin");
    await AdminService.verifyStaff(userId);

    revalidatePath("/admin/pengguna");
    return { success: true, message: "Akun petugas berhasil diverifikasi" };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal memverifikasi petugas" };
  }
}

export async function rejectPetugasAction(userId: string): Promise<ActionResult> {
  try {
    await requirePermission("super_admin");
    await AdminService.rejectStaff(userId);

    revalidatePath("/admin/pengguna");
    return { success: true, message: "Pendaftaran petugas ditolak dan akun dihapus" };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menolak pendaftaran" };
  }
}

export async function updatePetugasAction(data: any): Promise<ActionResult> {
  try {
    await requirePermission("super_admin");
    
    const { userId, role, phone, unitKerja, newPassword } = data;
    
    await AdminService.updateRole(userId, role);
    await UserService.updateProfile(userId, {
      phone,
      address: unitKerja,
      password: newPassword || undefined
    });

    revalidatePath("/admin/pengguna");
    return { success: true, message: "Data petugas berhasil diperbarui" };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal memperbarui data petugas" };
  }
}
