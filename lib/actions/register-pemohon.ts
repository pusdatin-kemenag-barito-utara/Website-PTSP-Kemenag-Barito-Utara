"use server";

import prisma from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";

export async function registerPemohonAction(formData: FormData) {
  const full_name = String(formData.get("full_name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const password = String(formData.get("password") || "");

  if (!phone || !password || !full_name) {
    throw new Error("Data tidak lengkap.");
  }

  const admin = createAdminClient();

  // 1. Check if phone already exists in profiles
  const existingProfile = await prisma.profiles.findFirst({
    where: { phone },
    select: { id: true },
  });

  if (existingProfile) {
    throw new Error("Nomor WhatsApp sudah terdaftar.");
  }

  // 2. Build internal email (using a cleaner format)
  const digits = phone.replace(/\D/g, "");
  const internalEmail = `p${digits}@ptsp.id`;

  // 3. Create user using Admin API (this bypasses email confirmation)
  const { data: authUser, error: authError } =
    await admin.auth.admin.createUser({
      email: internalEmail,
      password: password,
      email_confirm: true, // AUTO CONFIRM
      user_metadata: {
        full_name,
        phone,
        address,
        role: "user",
      },
    });

  if (authError || !authUser.user) {
    throw new Error(authError?.message || "Gagal membuat akun autentikasi.");
  }

  // 4. Create profile (sometimes the trigger might be slow or fail, we do it explicitly to be sure)
  try {
    await prisma.profiles.upsert({
      where: { id: authUser.user.id },
      update: {
        full_name,
        email: internalEmail,
        phone,
        address,
        role: "user" as any,
        plain_password: password,
      },
      create: {
        id: authUser.user.id,
        full_name,
        email: internalEmail,
        phone,
        address,
        role: "user" as any,
        plain_password: password,
      },
    });
  } catch (err) {
    // Cleanup if profile fails
    await admin.auth.admin.deleteUser(authUser.user.id);
    throw new Error("Gagal membuat profil pengguna.");
  }

  return { success: true };
}
