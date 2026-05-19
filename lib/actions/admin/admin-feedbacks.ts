"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { createAuditLog } from "@/lib/audit";

export type ActionResult = {
  success: boolean;
  message?: string;
  error?: string;
};

export async function deleteFeedbackAction(idStr: string): Promise<ActionResult> {
  const profile = await requirePermission("saran_pengaduan");
  try {
    const id = BigInt(idStr);

    // Fetch the feedback to log in audit trail
    const result = await db.execute(sql`
      SELECT name, phone, content FROM feedbacks WHERE id = ${id} LIMIT 1;
    `);

    const entry = result.rows[0] as { name: string; phone: string; content: string } | undefined;

    if (!entry) {
      return { success: false, error: "Saran & pengaduan tidak ditemukan" };
    }

    // Delete feedback
    await db.execute(sql`
      DELETE FROM feedbacks WHERE id = ${id};
    `);

    // Create Audit Log
    await createAuditLog({
      adminId: profile.id,
      action: "HAPUS_SARAN_PENGADUAN",
      entityType: "feedbacks",
      entityId: idStr,
      details: {
        name: entry.name,
        phone: entry.phone,
        content: entry.content,
      },
    });

    revalidatePath("/admin/saran-pengaduan");
    return { success: true, message: "Catatan saran & pengaduan berhasil dihapus" };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menghapus data saran & pengaduan" };
  }
}
