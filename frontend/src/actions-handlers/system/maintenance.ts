import { revalidatePath } from "@/lib/next-compat/cache";
import { fetchAPI } from "@/lib/api";
import { checkMaintenanceStatus } from "@/lib/maintenance";

export type MaintenanceStatus = {
  enabled: boolean;
  message: string;
  startedAt: Date | null;
  startedBy: string | null;
  aiChatEnabled: boolean;
};

// In-Memory cache untuk status AI Chat dari server lokal agar tidak membebani Fiber backend pada setiap request
let cachedAiChatEnabled: boolean = true;
let lastAiChatCheckedAt: number = 0;
const AI_CHAT_CACHE_TTL = 60 * 1000; // 60 detik cache di memori

export async function getMaintenanceStatus(): Promise<MaintenanceStatus> {
  // Status pemeliharaan 100% diambil dari trigger/cache tabel Pusdatin (0ms)
  const isPusdatinMaintenance = await checkMaintenanceStatus();

  const now = Date.now();
  if (now - lastAiChatCheckedAt < AI_CHAT_CACHE_TTL) {
    return {
      enabled: isPusdatinMaintenance,
      message: isPusdatinMaintenance
        ? "Sistem sedang dalam mode pemeliharaan terpusat oleh Tim Pusdatin Kemenag Barito Utara."
        : "Sistem berjalan normal.",
      startedAt: null,
      startedBy: isPusdatinMaintenance ? "Pusdatin" : null,
      aiChatEnabled: cachedAiChatEnabled,
    };
  }

  try {
    const res = await fetchAPI<any>("/admin/system/status");
    if (res && res.data) {
      cachedAiChatEnabled = res.data.aiChatEnabled ?? true;
      lastAiChatCheckedAt = now;
      return {
        enabled: isPusdatinMaintenance,
        message: isPusdatinMaintenance
          ? "Sistem sedang dalam mode pemeliharaan terpusat oleh Tim Pusdatin Kemenag Barito Utara."
          : (res.data.maintenanceMessage || "Sistem berjalan normal."),
        startedAt: null,
        startedBy: isPusdatinMaintenance ? "Pusdatin" : null,
        aiChatEnabled: cachedAiChatEnabled,
      };
    }
  } catch {
    // Abaikan jika backend lambat, gunakan cache terakhir
  }

  lastAiChatCheckedAt = now;
  return {
    enabled: isPusdatinMaintenance,
    message: isPusdatinMaintenance
      ? "Sistem sedang dalam mode pemeliharaan terpusat oleh Tim Pusdatin Kemenag Barito Utara."
      : "Sistem berjalan normal.",
    startedAt: null,
    startedBy: isPusdatinMaintenance ? "Pusdatin" : null,
    aiChatEnabled: cachedAiChatEnabled,
  };
}

/**
 * Toggle maintenance dinonaktifkan di admin PTSP sesuai instruksi:
 * Semua status maintenance dikendalikan 100% terpusat dari sistem Pusdatin.
 */
export async function toggleMaintenanceAction() {
  return {
    success: false,
    error: "Pengaturan mode pemeliharaan dikendalikan 100% secara terpusat oleh sistem Pusdatin Kemenag Barito Utara.",
    message: "Admin PTSP tidak memiliki akses mengubah status pemeliharaan terpusat.",
  };
}

export async function toggleAIChatAction(enabled: boolean) {
  try {
    await fetchAPI("/admin/system/guest-book-mode", {
      method: "PATCH",
      body: JSON.stringify({
        aiChatEnabled: enabled,
      }),
    });
    cachedAiChatEnabled = enabled;
    lastAiChatCheckedAt = Date.now();
  } catch (error) {
    console.error("Error toggleAIChatAction:", error);
  }

  revalidatePath("/admin/pemeliharaan-storage");
  revalidatePath("/");

  return {
    success: true,
    error: undefined,
    message: enabled
      ? "Widget AI Chat telah diaktifkan."
      : "Widget AI Chat telah disembunyikan.",
  };
}
