import { revalidatePath } from "@/lib/next-compat/cache";
import { requirePermission } from "@/lib/auth";
import { z } from "zod";
import { fetchAPI } from "@/lib/api";
import { createAuditLog } from "@/lib/audit";

export type ActionResult = {
  success: boolean;
  message?: string;
  error?: string;
};

const UpdateUserRoleSchema = z.object({
  id: z.string().uuid(),
  role: z.enum([
    "user",
    "admin_ptsp",
    "kepala_kantor",
    "kasubag_tu",
    "super_admin",
  ]),
});

const UpdateUserStatusSchema = z.object({
  userId: z.string().uuid(),
  isVerified: z.boolean().optional(),
  status: z.string().optional(),
});

const UpdateUserPermissionsSchema = z.object({
  userId: z.string().uuid(),
  permissions: z.array(z.string()),
});

const DeleteUserSchema = z.object({
  userId: z.string().uuid(),
});

export async function updateUserRoleAction(
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requirePermission("super_admin");
  try {
    const validated = UpdateUserRoleSchema.safeParse({
      id: formData.get("id"),
      role: formData.get("role"),
    });

    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const { id, role } = validated.data;

    await fetchAPI(`/admin/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });

    await createAuditLog({
      adminId: profile.id,
      action: "UBAH_ROLE_USER",
      entityType: "user",
      entityId: id,
      details: { role },
    });

    revalidatePath("/admin/pengguna");
    return { success: true, message: "Role pengguna berhasil diperbarui" };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal memperbarui role" };
  }
}

export async function updateUserPermissionsAction(
  userId: string,
  permissions: string[],
): Promise<ActionResult> {
  const profile = await requirePermission("super_admin");
  try {
    const validated = UpdateUserPermissionsSchema.safeParse({
      userId,
      permissions,
    });
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    await fetchAPI(`/admin/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ permissions }),
    });

    await createAuditLog({
      adminId: profile.id,
      action: "UBAH_PERMISSIONS_USER",
      entityType: "user",
      entityId: userId,
      details: { permissions },
    });

    revalidatePath("/admin/pengguna");
    return { success: true, message: "Izin akses berhasil diperbarui" };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal memperbarui izin",
    };
  }
}

export async function verifyStaffAction(
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requirePermission("super_admin");
  try {
    const validated = UpdateUserStatusSchema.safeParse({
      userId: formData.get("userId"),
      isVerified: true,
    });
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const { userId } = validated.data;

    await fetchAPI(`/admin/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ isVerified: true }),
    });

    await createAuditLog({
      adminId: profile.id,
      action: "VERIFIKASI_STAFF",
      entityType: "user",
      entityId: userId,
    });

    revalidatePath("/admin/pengguna");
    return { success: true, message: "Akun staff berhasil diverifikasi" };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal memverifikasi staff",
    };
  }
}

export async function deleteUserPermanentlyAction(
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requirePermission("super_admin");
  try {
    const validated = DeleteUserSchema.safeParse({
      userId: formData.get("userId"),
    });

    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const { userId } = validated.data;

    await fetchAPI(`/admin/users/${userId}`, {
      method: "DELETE",
    });

    await createAuditLog({
      adminId: profile.id,
      action: "HAPUS_USER_PERMANEN",
      entityType: "user",
      entityId: userId,
    });

    revalidatePath("/admin/pengguna");
    return {
      success: true,
      message: "Pengguna berhasil dihapus secara permanen",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Gagal menghapus pengguna",
    };
  }
}
