import { db } from "@/lib/db";
import { profiles as profilesTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createAdminClient } from "@/lib/supabase/admin";

export class AuthService {
  /**
   * Register a new applicant (Pemohon)
   */
  static async registerPemohon(data: any) {
    const { fullName, phone, address, password } = data;
    const admin = createAdminClient();

    // 1. Check uniqueness
    const existing = await db.query.profiles.findFirst({
      where: eq(profilesTable.phone, phone),
      columns: { id: true },
    });
    if (existing) throw new Error("Nomor WhatsApp sudah terdaftar.");

    // 2. Format internal email
    const digits = phone.replace(/\D/g, "");
    const internalEmail = `p${digits}@ptsp.id`;

    // 3. Create Auth User
    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email: internalEmail,
      password: password,
      email_confirm: true,
      user_metadata: { full_name: fullName, phone, address, role: "user" },
    });

    if (authError || !authUser.user) throw new Error(authError?.message || "Gagal membuat akun.");

    // 4. Create Profile
    try {
      await db
        .insert(profilesTable)
        .values({
          id: authUser.user.id,
          fullName,
          email: internalEmail,
          phone,
          address,
          role: "user",
          plainPassword: password,
        })
        .onConflictDoUpdate({
          target: profilesTable.id,
          set: { fullName, email: internalEmail, phone, address, plainPassword: password, updatedAt: new Date() },
        });
    } catch (err) {
      await admin.auth.admin.deleteUser(authUser.user.id);
      throw err;
    }
  }

  /**
   * Register a new staff member (Petugas)
   */
  static async registerPetugas(data: any) {
    const { fullName, phone, address, password, role, permissions = [] } = data;
    const admin = createAdminClient();

    const existing = await db.query.profiles.findFirst({
      where: eq(profilesTable.phone, phone),
      columns: { id: true },
    });
    if (existing) throw new Error("Nomor WhatsApp sudah terdaftar.");

    const digits = phone.replace(/\D/g, "");
    const internalEmail = `staff_${digits}@ptsp.id`;

    const { data: authUser, error: authError } = await admin.auth.admin.createUser({
      email: internalEmail,
      password: password,
      email_confirm: true,
      user_metadata: { full_name: fullName, phone, address, role },
    });

    if (authError || !authUser.user) throw new Error(authError?.message || "Gagal membuat akun.");

    try {
      await db
        .insert(profilesTable)
        .values({
          id: authUser.user.id,
          fullName,
          email: internalEmail,
          phone,
          address,
          role,
          permissions,
          plainPassword: password,
          isVerified: false,
        })
        .onConflictDoUpdate({
          target: profilesTable.id,
          set: { fullName, email: internalEmail, phone, address, role, permissions, plainPassword: password, isVerified: false, updatedAt: new Date() },
        });
    } catch (err) {
      await admin.auth.admin.deleteUser(authUser.user.id);
      throw err;
    }
  }
}
