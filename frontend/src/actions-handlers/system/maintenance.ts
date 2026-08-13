import { revalidatePath } from "@/lib/next-compat/cache";
import { fetchAPI } from "@/lib/api";

export type MaintenanceStatus = {
  enabled: boolean;
  message: string;
  startedAt: Date | null;
  startedBy: string | null;
  aiChatEnabled: boolean;
};

export async function getMaintenanceStatus(): Promise<MaintenanceStatus> {
  try {
    const res = await fetchAPI<any>("/admin/system/status", { cache: "no-store" });
    if (res && res.data) {
      return {
        enabled: res.data.maintenanceMode ?? false,
        message: res.data.maintenanceMessage || "Sistem sedang dalam pemeliharaan berkala.",
        startedAt: res.data.maintenanceStartedAt ? new Date(res.data.maintenanceStartedAt) : null,
        startedBy: res.data.maintenanceStartedBy || null,
        aiChatEnabled: res.data.aiChatEnabled ?? true,
      };
    }
  } catch (error) {
    console.error("Error getMaintenanceStatus:", error);
  }

  return {
    enabled: false,
    message: "Sistem sedang dalam pemeliharaan berkala.",
    startedAt: null,
    startedBy: null,
    aiChatEnabled: true,
  };
}

export async function toggleMaintenanceAction(
  enabled: boolean,
  message?: string,
) {
  try {
    await fetchAPI("/admin/system/guest-book-mode", {
      method: "PATCH",
      body: JSON.stringify({
        maintenanceMode: enabled,
        maintenanceMessage: message || "Sistem sedang dalam pemeliharaan berkala.",
      }),
    });
  } catch (error) {
    console.error("Error toggleMaintenanceAction:", error);
  }

  revalidatePath("/admin/mode-pemeliharaan");
  revalidatePath("/admin");

  return {
    success: true,
    error: undefined,
    message: enabled
      ? "Mode Pemeliharaan telah diaktifkan."
      : "Mode Pemeliharaan telah dinonaktifkan.",
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

