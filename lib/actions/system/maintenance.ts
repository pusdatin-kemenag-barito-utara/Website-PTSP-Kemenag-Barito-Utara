"use server";

import { db } from "@/lib/db";
import { systemStatus, auditLogs } from "@/lib/db/schema";
import { requirePermission } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type MaintenanceStatus = {
  enabled: boolean;
  message: string;
  startedAt: Date | null;
  startedBy: string | null;
};

/**
 * Get current maintenance mode status
 */
export async function getMaintenanceStatus(): Promise<MaintenanceStatus> {
  try {
    const result = await db.query.systemStatus.findFirst({
      where: eq(systemStatus.id, "maintenance"),
    });

    return {
      enabled: result?.maintenanceMode ?? false,
      message:
        result?.maintenanceMessage ??
        "Sistem sedang dalam pemeliharaan berkala. Silakan kembali beberapa saat lagi.",
      startedAt: result?.maintenanceStartedAt ?? null,
      startedBy: result?.maintenanceStartedBy ?? null,
    };
  } catch {
    return {
      enabled: false,
      message:
        "Sistem sedang dalam pemeliharaan berkala. Silakan kembali beberapa saat lagi.",
      startedAt: null,
      startedBy: null,
    };
  }
}

/**
 * Toggle maintenance mode ON or OFF. Super Admin only.
 */
export async function toggleMaintenanceAction(
  enabled: boolean,
  message?: string,
) {
  try {
    const profile = await requirePermission("mode_pemeliharaan");

    const defaultMessage =
      "Sistem sedang dalam pemeliharaan berkala. Silakan kembali beberapa saat lagi.";

    await db
      .insert(systemStatus)
      .values({
        id: "maintenance",
        maintenanceMode: enabled,
        maintenanceMessage: message || defaultMessage,
        maintenanceStartedAt: enabled ? new Date() : null,
        maintenanceStartedBy: enabled ? profile.id : null,
      })
      .onConflictDoUpdate({
        target: systemStatus.id,
        set: {
          maintenanceMode: enabled,
          maintenanceMessage: message || defaultMessage,
          maintenanceStartedAt: enabled ? new Date() : null,
          maintenanceStartedBy: enabled ? profile.id : null,
        },
      });

    // Log audit
    await db.insert(auditLogs).values({
      adminId: profile.id,
      action: enabled ? "MAINTENANCE_ON" : "MAINTENANCE_OFF",
      entityType: "system",
      entityId: "maintenance",
      details: {
        message: message || defaultMessage,
        action: enabled ? "Mengaktifkan Mode Pemeliharaan" : "Menonaktifkan Mode Pemeliharaan",
      },
    });

    revalidatePath("/admin/mode-pemeliharaan");
    revalidatePath("/admin");

    return {
      success: true,
      message: enabled
        ? "Mode Pemeliharaan telah diaktifkan. Seluruh halaman publik kini menampilkan halaman pemeliharaan."
        : "Mode Pemeliharaan telah dinonaktifkan. Website kembali normal.",
    };
  } catch (error: any) {
    console.error("Toggle maintenance error:", error);
    return {
      success: false,
      error: error.message || "Gagal mengubah status pemeliharaan.",
    };
  }
}
