"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function checkPhoneExistsAction(phone: string) {
  if (!phone) return { error: "Nomor HP wajib diisi." };

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.phone, phone),
    columns: { id: true },
  });

  if (!profile) {
    return { exists: false };
  }
  return { exists: true };
}

export async function resetPasswordByPhoneAction(
  phone: string,
  newPassword: string,
) {
  if (!phone || !newPassword) {
    return { error: "Data tidak lengkap." };
  }

  if (newPassword.length < 6) {
    return { error: "Password minimal 6 karakter." };
  }

  const admin = createAdminClient();

  // 1. Cari user berdasarkan nomor HP di tabel profiles
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.phone, phone),
    columns: { id: true, fullName: true, email: true },
  });

  if (!profile) {
    return { error: "Nomor HP tidak terdaftar dalam sistem." };
  }

  try {
    // 2. Update password di sistem Auth menggunakan Admin API
    const { error: authError } = await admin.auth.admin.updateUserById(
      profile.id,
      { password: newPassword },
    );

    if (authError) {
      return {
        error:
          "Gagal memperbarui password di sistem keamanan: " + authError.message,
      };
    }

    // 3. Update plain_password di tabel profiles agar tetap sinkron untuk Super Admin
    await db
      .update(profiles)
      .set({ plainPassword: newPassword })
      .where(eq(profiles.id, profile.id));

    return { success: true, name: profile.fullName };
  } catch (err: any) {
    return { error: "Terjadi kesalahan internal: " + err.message };
  }
}
