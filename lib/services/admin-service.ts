import { db } from "@/lib/db";
import { profiles as profilesTable, serviceRequests as serviceRequestsTable, serviceRequestDocuments as serviceRequestDocumentsTable, generatedDocuments as generatedDocumentsTable } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteFromR2 } from "@/lib/r2";

export class AdminService {
  /**
   * Update user role
   */
  static async updateRole(id: string, role: any) {
    await db
      .update(profilesTable)
      .set({ role, updatedAt: new Date() })
      .where(eq(profilesTable.id, id));
  }

  /**
   * Update user permissions
   */
  static async updatePermissions(userId: string, permissions: string[]) {
    await db
      .update(profilesTable)
      .set({ permissions, updatedAt: new Date() })
      .where(eq(profilesTable.id, userId));
  }

  /**
   * Delete user permanently from both Auth and Database, including all files
   */
  static async deleteUserPermanently(userId: string) {
    const admin = createAdminClient();

    // 1. Get all file paths associated with user's requests
    const requests = await db.query.serviceRequests.findMany({
      where: eq(serviceRequestsTable.userId, userId),
      columns: { id: true },
    });

    const requestIds = requests.map((r: any) => r.id);

    if (requestIds.length > 0) {
      const [reqDocs, genDocs] = await Promise.all([
        db.query.serviceRequestDocuments.findMany({
          where: inArray(serviceRequestDocumentsTable.requestId, requestIds),
          columns: { filePath: true },
        }),
        db.query.generatedDocuments.findMany({
          where: inArray(generatedDocumentsTable.requestId, requestIds),
          columns: { filePath: true },
        }),
      ]);

      const combinedPaths = [
        ...reqDocs.map((d: any) => d.filePath),
        ...genDocs.map((d: any) => d.filePath),
      ];

      // 2. Delete files from R2
      for (const path of combinedPaths) {
        if (path?.startsWith("r2:")) {
          await deleteFromR2(path).catch(() => {});
        }
      }
    }

    // 3. Delete from Supabase Auth
    const { error: authError } = await admin.auth.admin.deleteUser(userId);
    if (authError) throw new Error(`Gagal menghapus akun auth: ${authError.message}`);

    // 4. Delete profile (cascades to requests if configured, or delete manually)
    await db.delete(profilesTable).where(eq(profilesTable.id, userId));
  }

  /**
   * Verify staff account
   */
  static async verifyStaff(userId: string) {
    await db
      .update(profilesTable)
      .set({ isVerified: true })
      .where(eq(profilesTable.id, userId));
  }

  /**
   * Reject staff account (delete it)
   */
  static async rejectStaff(userId: string) {
    const admin = createAdminClient();
    await db.delete(profilesTable).where(eq(profilesTable.id, userId));
    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) throw new Error(error.message);
  }
}
