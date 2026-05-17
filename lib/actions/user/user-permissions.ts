"use server";

import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateUserPermissionsAction(
  userId: string,
  permissions: string[],
) {
  // Only super_admin can do this
  const profile = await requireAdmin();
  if (profile.role !== "super_admin") {
    return { error: "Hanya Super Admin yang dapat mengubah hak akses." };
  }

  try {
    await db
      .update(profiles)
      .set({ permissions })
      .where(eq(profiles.id, userId));

    revalidatePath("/admin");
    revalidatePath("/admin/pengguna");

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
