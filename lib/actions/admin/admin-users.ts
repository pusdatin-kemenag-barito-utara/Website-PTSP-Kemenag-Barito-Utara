"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth";
import { z } from "zod";
import { AdminService } from "@/lib/services/admin-service";
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

const UpdateUserPermissionsSchema = z.object({
  userId: z.string().uuid(),
  permissions: z.array(z.string()),
});

const DeleteUserSchema = z.object({
  userId: z.string().uuid(),
});

export async function updateUserRoleAction(formData: FormData): Promise<ActionResult> {
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
    await AdminService.updateRole(id, role);

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
    const validated = UpdateUserPermissionsSchema.safeParse({ userId, permissions });
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    await AdminService.updatePermissions(userId, permissions);

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
    return { success: false, error: error.message || "Gagal memperbarui izin" };
  }
}

export async function deleteUserPermanentlyAction(formData: FormData): Promise<ActionResult> {
  const profile = await requirePermission("super_admin");
  try {
    const validated = DeleteUserSchema.safeParse({
      userId: formData.get("userId"),
    });

    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    const { userId } = validated.data;
    await AdminService.deleteUserPermanently(userId);

    await createAuditLog({
      adminId: profile.id,
      action: "HAPUS_USER_PERMANEN",
      entityType: "user",
      entityId: userId,
    });

    revalidatePath("/admin/pengguna");
    return { success: true, message: "Pengguna berhasil dihapus secara permanen" };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menghapus pengguna" };
  }
}
