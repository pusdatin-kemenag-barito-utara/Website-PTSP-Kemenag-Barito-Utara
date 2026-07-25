import { db } from "@/lib/db";
import { profiles as profilesTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createAdminClient } from "@/lib/supabase/admin";

export class UserService {
  /**
   * Update user profile and sync with Supabase Auth if needed
   */
  static async updateProfile(userId: string, data: any) {
    const admin = createAdminClient();
    const { fullName, phone, address, password } = data;

    const updateData: any = {
      fullName,
      phone,
      address,
      updatedAt: new Date(),
    };

    const authUpdates: any = {};
    
    // Phone is just updated in the profiles table now.
    // We no longer overwrite the email address based on the phone number
    // to preserve custom emails like @kemenag.go.id.

    if (password) {
      authUpdates.password = password;
    }

    // 1. Sync with Supabase Auth
    if (Object.keys(authUpdates).length > 0) {
      const { error: authError } = await admin.auth.admin.updateUserById(userId, authUpdates);
      if (authError) throw new Error(`Gagal memperbarui akun: ${authError.message}`);
    }

    // 2. Update Database Profile (Schema PTSP)
    await db
      .update(profilesTable)
      .set(updateData)
      .where(eq(profilesTable.id, userId));

    // 3. Sync to Pusdatin Schema (kemenag_pusdatin.profiles & kemenag_pusdatin.profiles_pemohon)
    try {
      const { sql } = await import("drizzle-orm");

      // Update kemenag_pusdatin.profiles
      await db.execute(sql`
        UPDATE "kemenag_pusdatin"."profiles"
        SET name = ${fullName},
            phone = ${phone},
            address = ${address},
            updated_at = NOW()
        WHERE id = ${userId} OR email = (SELECT email FROM "kemenag_pusdatin"."profiles" WHERE id = ${userId})
      `);

      // Update kemenag_pusdatin.profiles_pemohon jika record user ada di Pusdatin
      await db.execute(sql`
        UPDATE "kemenag_pusdatin"."profiles_pemohon"
        SET no_hp = ${phone},
            alamat = ${address},
            updated_at = NOW()
        WHERE user_id = ${userId}
      `);
    } catch (pusdatinSyncErr) {
      console.error("[PUSDATIN SYNC ERROR] Gagal menyinkronkan data ke schema Pusdatin:", pusdatinSyncErr);
    }
  }
}
