"use server";

import { db } from "@/lib/db";
import { systemStatus, auditLogs, satelliteApps } from "@/lib/db/schema";
import { requirePermission } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type MaintenanceStatus = {
  enabled: boolean;
  message: string;
  startedAt: Date | null;
  startedBy: string | null;
  aiChatEnabled: boolean;
};

/**
 * Get current maintenance mode status
 */
export async function getMaintenanceStatus(): Promise<MaintenanceStatus> {
  try {
    const [app] = await db.select({ status: satelliteApps.status, lastHealthCheck: satelliteApps.lastHealthCheck }).from(satelliteApps).where(eq(satelliteApps.id, "ptsp-kemenag"));
    
    // We still need AI chat from systemStatus since that's a local feature
    const result = await db.query.systemStatus.findFirst({
      where: eq(systemStatus.id, "maintenance"),
    });

    return {
      enabled: app?.status === "maintenance",
      message: "Sistem sedang dalam pemeliharaan berkala. Silakan kembali beberapa saat lagi.",
      startedAt: app?.lastHealthCheck ?? null,
      startedBy: null, // we don't store startedBy in satelliteApps currently
      aiChatEnabled: result?.aiChatEnabled ?? true,
    };
  } catch {
    return {
      enabled: false,
      message:
        "Sistem sedang dalam pemeliharaan berkala. Silakan kembali beberapa saat lagi.",
      startedAt: null,
      startedBy: null,
      aiChatEnabled: true,
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

    // Update centralized satelliteApps
    await db
      .update(satelliteApps)
      .set({
        status: enabled ? "maintenance" : "online",
        lastHealthCheck: new Date(),
      })
      .where(eq(satelliteApps.id, "ptsp-kemenag"));

    // Log audit
    await db.insert(auditLogs).values({
      performedBy: profile.id,
      action: enabled ? "MAINTENANCE_ON" : "MAINTENANCE_OFF",
      target: "system",
      afterState: {
        entityId: "maintenance",
        message: message || defaultMessage,
        action: enabled ? "Mengaktifkan Mode Pemeliharaan" : "Menonaktifkan Mode Pemeliharaan",
      },
    });

    revalidatePath("/admin/mode-pemeliharaan");
    revalidatePath("/admin");

    return {
      success: true,
      message: enabled
        ? "Mode Pemeliharaan telah diaktifkan secara terpusat. Seluruh halaman publik kini menampilkan halaman pemeliharaan."
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

/**
 * Toggle AI Chat ON or OFF. Super Admin only.
 */
export async function toggleAIChatAction(enabled: boolean) {
  try {
    const profile = await requirePermission("pemeliharaan_storage"); // Using the same permission as the page

    await db
      .insert(systemStatus)
      .values({
        id: "maintenance",
        aiChatEnabled: enabled,
      })
      .onConflictDoUpdate({
        target: systemStatus.id,
        set: {
          aiChatEnabled: enabled,
        },
      });

    // Log audit
    await db.insert(auditLogs).values({
      performedBy: profile.id,
      action: enabled ? "AI_CHAT_ON" : "AI_CHAT_OFF",
      target: "system",
      afterState: {
        entityId: "ai_chat",
        action: enabled ? "Mengaktifkan AI Chat Widget" : "Menonaktifkan AI Chat Widget",
      },
    });

    revalidatePath("/admin/pemeliharaan-storage");
    revalidatePath("/");

    return {
      success: true,
      message: enabled
        ? "Widget AI Chat telah diaktifkan."
        : "Widget AI Chat telah disembunyikan dari semua halaman.",
    };
  } catch (error: any) {
    console.error("Toggle AI Chat error:", error);
    return {
      success: false,
      error: error.message || "Gagal mengubah status AI Chat.",
    };
  }
}

