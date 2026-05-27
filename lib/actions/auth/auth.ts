"use server";

import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getProfileAfterLoginAction(userId: string) {
  if (!userId) return { error: "ID pengguna tidak valid." };

  try {
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, userId),
      columns: {
        role: true,
        isVerified: true,
      },
    });

    if (!profile) {
      return { error: "Profil tidak ditemukan." };
    }

    return { data: profile };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updatePasswordHashAction(
  userId: string,
  password: string,
) {
  if (!userId || !password) return { error: "Data tidak lengkap." };

  try {
    // Password is hashed by Supabase Auth - we just sync via Admin API
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.updateUserById(userId, { password });
    if (error) throw new Error(error.message);

    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
