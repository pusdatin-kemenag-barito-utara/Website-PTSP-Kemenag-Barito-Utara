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
    
    // If phone changes, we update email (based on user role pattern)
    if (phone) {
      const digits = phone.replace(/\D/g, "");
      const profile = await db.query.profiles.findFirst({
        where: eq(profilesTable.id, userId),
        columns: { role: true },
      });
      const prefix = profile?.role === "user" ? "p" : "staff_";
      const newEmail = `${prefix}${digits}@ptsp.id`;
      
      authUpdates.email = newEmail;
      authUpdates.email_confirm = true;
      updateData.email = newEmail;
    }

    if (password) {
      authUpdates.password = password;
    }

    // 1. Sync with Supabase Auth
    if (Object.keys(authUpdates).length > 0) {
      const { error: authError } = await admin.auth.admin.updateUserById(userId, authUpdates);
      if (authError) throw new Error(`Gagal memperbarui akun: ${authError.message}`);
    }

    // 2. Update Database Profile
    await db
      .update(profilesTable)
      .set(updateData)
      .where(eq(profilesTable.id, userId));
  }
}
