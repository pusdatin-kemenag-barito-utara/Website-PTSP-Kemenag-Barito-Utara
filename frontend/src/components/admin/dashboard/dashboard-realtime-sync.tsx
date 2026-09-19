import { useEffect, useRef } from "react";
import { useRouter } from "@/lib/next-compat/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function DashboardRealtimeSync() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    const supabase = supabaseRef.current;

    // Initialize audio from local public folder to satisfy CSP
    audioRef.current = new Audio("/sounds/notification.mp3");
    
    // Subscribe to new service requests
    const channel = supabase
      .channel("admin_dashboard_sync")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "kemenag_ptsp",
          table: "ptsp_service_requests",
        },
        (payload) => {
          console.log("New request received:", payload);
          
          // 1. Play notification sound
          if (audioRef.current) {
            audioRef.current.play().catch((err) => console.log("Audio play blocked by browser:", err));
          }
          
          // 2. Show a toast
          toast.success("Ada pengajuan layanan baru masuk!", {
            description: `Nomor: ${(payload.new as any)?.request_number || 'Baru'}`,
            duration: 10000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return null; // Logic-only component
}
