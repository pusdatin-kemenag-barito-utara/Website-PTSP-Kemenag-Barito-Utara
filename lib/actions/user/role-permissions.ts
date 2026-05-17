"use server";

import { db } from "@/lib/db";
import { rolePermissions } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getRolePermissions() {
  try {
    const data = await db.select().from(rolePermissions);
    return data || [];
  } catch (error: any) {
    console.error("Error fetching role permissions:", error.message);
    return [];
  }
}

export async function updateRolePermissionsAction(
  role: string,
  permissions: string[],
) {
  // Only super_admin can do this
  const profile = await requireAdmin();
  if (profile.role !== "super_admin") {
    return { error: "Hanya Super Admin yang dapat mengubah hak akses." };
  }

  try {
    await db
      .insert(rolePermissions)
      .values({
        role,
        permissions,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: rolePermissions.role,
        set: {
          permissions,
          updatedAt: new Date(),
        },
      });

    revalidatePath("/admin");
    revalidatePath("/admin/pengguna");

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
