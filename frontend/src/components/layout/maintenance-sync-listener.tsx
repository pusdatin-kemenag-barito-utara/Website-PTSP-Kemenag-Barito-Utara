import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * MaintenanceSyncListener:
 * Mendengarkan perubahan status maintenance/online secara REALTIME via WebSocket (Supabase Realtime)
 * langsung dari tabel database kemenag_pusdatin.satellite_apps (id = 'ptsp-kemenag').
 *
 * Sesuai arsitektur Pusdatin:
 * - 100% event-driven trigger dari database Pusdatin.
 * - ZERO periodic polling loop (tidak ada setInterval).
 * - Saat Pusdatin mengubah status menjadi 'maintenance' -> browser langsung redirect ke /maintenance.
 * - Saat Pusdatin mengembalikan status menjadi 'online' -> browser di halaman /maintenance langsung redirect kembali ke /.
 */
export function MaintenanceSyncListener() {
  const isNavigatingRef = useRef(false);

  useEffect(() => {
    const supabase = createClient();

    const handleStatusTransition = (isMaintenance: boolean) => {
      if (isNavigatingRef.current) return;
      const pathname = window.location.pathname;
      const isCurrentMaintenancePage = pathname === "/maintenance";
      const isAdminRoute = pathname.startsWith("/admin") || pathname === "/login/petugas";

      if (isMaintenance && !isCurrentMaintenancePage && !isAdminRoute) {
        // Status di Pusdatin berubah jadi MAINTENANCE -> otomatis redirect ke /maintenance
        isNavigatingRef.current = true;
        window.location.href = "/maintenance";
      } else if (!isMaintenance && isCurrentMaintenancePage) {
        // Status di Pusdatin berubah jadi ONLINE -> otomatis redirect kembali ke beranda /
        isNavigatingRef.current = true;
        window.location.href = "/";
      }
    };

    // 1. REALTIME WEBSOCKET: Dengarkan CDC event langsung dari PostgreSQL tabel Pusdatin
    const channel = supabase
      .channel("ptsp-realtime-pusdatin-sync")
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
            handleStatusTransition(newStatus === "maintenance");
          }
        }
      )
      .subscribe();

    // 2. FOCUS EVENT: Saat user beralih tab dari Pusdatin kembali ke tab PTSP
    const handleVisibilityOrFocus = async () => {
      if (document.visibilityState === "visible" && !isNavigatingRef.current) {
        try {
          const { data } = await supabase
            .schema("kemenag_pusdatin" as any)
            .from("satellite_apps")
            .select("status")
            .eq("id", "ptsp-kemenag")
            .single();

          if (data?.status) {
            handleStatusTransition(data.status === "maintenance");
          }
        } catch {
          // Abaikan jika network belum siap
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityOrFocus);
    window.addEventListener("focus", handleVisibilityOrFocus);

    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      window.removeEventListener("focus", handleVisibilityOrFocus);
    };
  }, []);

  return null;
}
