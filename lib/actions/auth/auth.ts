"use server";

import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { isSuperAdmin, ALL_ADMIN_MENUS } from "@/lib/constants";

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
      // Cek apakah user adalah super admin berdasarkan email dari Supabase Auth
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const admin = createAdminClient();
      const { data: userData, error: userError } = await admin.auth.admin.getUserById(userId);

      if (userError || !userData?.user?.email) {
        return { error: "Profil tidak ditemukan." };
      }

      const userEmail = userData.user.email;

      if (isSuperAdmin(userEmail)) {
        // Auto-buat profil super admin jika belum ada
        try {
          await db.insert(profiles).values({
            id: userId,
            email: userEmail,
            fullName: "ADMIN PTSP",
            role: "super_admin",
            isVerified: true,
            permissions: ALL_ADMIN_MENUS,
          }).onConflictDoUpdate({
            target: profiles.id,
            set: {
              role: "super_admin",
              isVerified: true,
              email: userEmail,
              permissions: ALL_ADMIN_MENUS,
            },
          });
        } catch (insertErr) {
          console.error("Gagal auto-create profil super admin:", insertErr);
        }

        // Kembalikan data super admin langsung
        return { data: { role: "super_admin" as const, isVerified: true } };
      }

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
