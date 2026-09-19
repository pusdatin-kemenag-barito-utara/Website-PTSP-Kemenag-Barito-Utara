import type { RealtimeChannel } from "@supabase/supabase-js";

export interface MaintenanceMemoryState {
  isMaintenance: boolean;
  status: "online" | "maintenance";
  lastUpdated: number;
}

// In-Memory singleton state pada runtime server
let memoryState: MaintenanceMemoryState = {
  isMaintenance: false,
  status: "online",
  lastUpdated: 0,
};

let isInitialized = false;
let initPromise: Promise<boolean> | null = null;
let serverChannel: RealtimeChannel | null = null;

/**
 * Inisialisasi status maintenance langsung dari tabel database kemenag_pusdatin.satellite_apps
 * dan daftarkan WebSocket Realtime listener (PostgreSQL CDC) pada proses server.
 * Dipanggil hanya 1 kali saat server pertama kali dijalankan (singleton).
 */
async function initServerMaintenance(): Promise<boolean> {
  if (isInitialized) {
    return memoryState.isMaintenance;
  }
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabase = createAdminClient();

      // 1. Ambil ground truth status awal LANGSUNG dari tabel database Pusdatin
      const { data, error } = await supabase
        .schema("kemenag_pusdatin" as any)
        .from("satellite_apps")
        .select("status")
        .eq("id", "ptsp-kemenag")
        .single();

      if (!error && data?.status) {
        const isMaint = data.status === "maintenance";
        memoryState = {
          isMaintenance: isMaint,
          status: isMaint ? "maintenance" : "online",
          lastUpdated: Date.now(),
        };
        console.log(`[Pusdatin Status] Status awal dari DB: ${data.status} (Maintenance: ${isMaint})`);
      } else {
        console.warn("[Pusdatin Status] Gagal membaca status awal Pusdatin, default ke online:", error?.message);
      }

      isInitialized = true;

      // 2. Hubungkan listener Supabase Realtime di level server
      // Trigger murni dari perubahan status pada tabel kemenag_pusdatin.satellite_apps
      if (!serverChannel) {
        try {
          serverChannel = supabase
            .channel("server-pusdatin-maintenance-cdc")
            .on(
              "postgres_changes",
              {
                event: "UPDATE",
                schema: "kemenag_pusdatin",
                table: "satellite_apps",
                filter: "id=eq.ptsp-kemenag",
              },
              (payload: any) => {
                const newStatus = payload.new?.status;
                if (newStatus) {
                  const isMaint = newStatus === "maintenance";
                  memoryState = {
                    isMaintenance: isMaint,
                    status: isMaint ? "maintenance" : "online",
                    lastUpdated: Date.now(),
                  };
                  console.log(`[Pusdatin DB Trigger] Status berubah di DB -> ${newStatus} (Maintenance: ${isMaint})`);
                }
              }
            )
            .subscribe((status: string) => {
              if (status === "SUBSCRIBED") {
                console.log("[Pusdatin DB Trigger] Server aktif berlangganan perubahan status kemenag_pusdatin.satellite_apps");
              }
            });
        } catch (subErr) {
          console.error("[Pusdatin DB Trigger] Error mendaftarkan server realtime subscription:", subErr);
        }
      }
    } catch (err) {
      console.error("[Pusdatin Status] Init error:", err);
      isInitialized = true; // Hindari blocking jika terjadi network failure
    }

    return memoryState.isMaintenance;
  })();

  return initPromise;
}

/**
 * Memeriksa apakah PTSP dalam mode pemeliharaan.
 * Status dibaca LANGSUNG dari memori server (0ms, 0 query database, 0 request HTTP).
 * Perubahan status diperbarui secara instan oleh Trigger Database Realtime dari tabel Pusdatin.
 */
export async function checkMaintenanceStatus(): Promise<boolean> {
  if (!isInitialized) {
    return await initServerMaintenance();
  }
  return memoryState.isMaintenance;
}

/**
 * Mengambil detail status Pusdatin dari memori server.
 */
export async function getMaintenanceDetails(): Promise<MaintenanceMemoryState> {
  if (!isInitialized) {
    await initServerMaintenance();
  }
  return memoryState;
}

/**
 * Sinkronisasi paksa dari database kemenag_pusdatin.satellite_apps (misal dipanggil oleh webhook/endpoint)
 */
export async function syncMaintenanceFromPusdatin(): Promise<MaintenanceMemoryState> {
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .schema("kemenag_pusdatin" as any)
      .from("satellite_apps")
      .select("status")
      .eq("id", "ptsp-kemenag")
      .single();

    if (!error && data?.status) {
      const isMaint = data.status === "maintenance";
      memoryState = {
        isMaintenance: isMaint,
        status: isMaint ? "maintenance" : "online",
        lastUpdated: Date.now(),
      };
      console.log(`[Pusdatin Sync] Status berhasil disinkronkan manual dari DB: ${data.status}`);
    }
  } catch (err) {
    console.error("[Pusdatin Sync] Error sinkronisasi:", err);
  }
  return memoryState;
}

/**
 * Set status memori lokal (untuk keperluan internal atau testing)
 */
export function setCachedMaintenanceStatus(isMaintenance: boolean) {
  memoryState = {
    isMaintenance,
    status: isMaintenance ? "maintenance" : "online",
    lastUpdated: Date.now(),
  };
}
