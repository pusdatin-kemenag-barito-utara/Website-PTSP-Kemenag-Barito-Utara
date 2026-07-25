import { db } from "@/lib/db";
import { profiles as profilesTable, profilesPemohon } from "@/lib/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { createAdminClient } from "@/lib/supabase/admin";

export class AuthService {
  /**
   * Register a new applicant (Pemohon)
   */
  static async registerPemohon(data: any) {
    const { fullName, phone, address, password } = data;
    const admin = createAdminClient();

    // 0. Validate password
    if (!password || password.length < 6) {
      throw new Error("Password minimal 6 karakter.");
    }

    // 1. Check uniqueness & orphaned profiles
    const existing = await db.query.profiles.findFirst({
      where: and(
        eq(profilesTable.phone, phone),
        eq(profilesTable.role, "user")
      ),
      columns: { id: true },
    });
    
    if (existing) {
      const { error: authError } = await admin.auth.admin.getUserById(existing.id);
      if (authError && (authError.message.includes("User not found") || authError.status === 404)) {
        // Profil yatim (orphaned), hapus agar bisa daftar baru
        await db.delete(profilesTable).where(eq(profilesTable.id, existing.id));
      } else if (!authError) {
        throw new Error("Nomor WhatsApp sudah terdaftar sebagai pemohon.");
      } else {
        throw new Error("Gagal memverifikasi status akun: " + authError.message);
      }
    }

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
          userType: "eksternal_masyarakat",
        })
        .onConflictDoUpdate({
          target: profilesTable.id,
          set: { fullName, email: internalEmail, phone, address, userType: "eksternal_masyarakat", updatedAt: new Date() },
        });

      await db
        .insert(profilesPemohon)
        .values({
          profileId: authUser.user.id,
          fullName,
          noHp: phone,
          alamat: address,
        });

      // Sync to Pusdatin Schema
      try {
        const { sql } = await import("drizzle-orm");
        await db.execute(sql`
          INSERT INTO "kemenag_pusdatin"."profiles" (id, name, email, phone, address, role, user_type, status, created_at, updated_at)
          VALUES (${authUser.user.id}, ${fullName}, ${internalEmail}, ${phone}, ${address}, 'user', 'eksternal_masyarakat', 'active', NOW(), NOW())
          ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, phone = EXCLUDED.phone, address = EXCLUDED.address, updated_at = NOW()
        `);

        await db.execute(sql`
          INSERT INTO "kemenag_pusdatin"."profiles_pemohon" (user_id, full_name, no_hp, alamat, updated_at)
          VALUES (${authUser.user.id}, ${fullName}, ${phone}, ${address}, NOW())
        `);
      } catch (pusdatinErr) {
        console.error("[PUSDATIN REGISTRATION SYNC ERROR]:", pusdatinErr);
      }
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

    if (!password || password.length < 6) {
      throw new Error("Password minimal 6 karakter.");
    }

    const existing = await db.query.profiles.findFirst({
      where: and(
        eq(profilesTable.phone, phone),
        ne(profilesTable.role, "user")
      ),
      columns: { id: true },
    });
    if (existing) throw new Error("Nomor WhatsApp sudah terdaftar sebagai pegawai.");

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
          isVerified: false,
        })
        .onConflictDoUpdate({
          target: profilesTable.id,
          set: { fullName, email: internalEmail, phone, address, role, permissions, isVerified: false, updatedAt: new Date() },
        });
    } catch (err) {
      await admin.auth.admin.deleteUser(authUser.user.id);
      throw err;
    }
  }
}
