"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function DashboardRealtimeSync() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
    
    // Subscribe to new service requests
    const channel = supabase
      .channel("admin_dashboard_sync")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "service_requests",
        },
        (payload) => {
          console.log("New request received:", payload);
          
          // 1. Refresh the dashboard data
          router.refresh();
          
          // 2. Play notification sound
          if (audioRef.current) {
            audioRef.current.play().catch(err => console.log("Audio play blocked by browser:", err));
          }
          
          // 3. Show a toast
          toast.success("Ada pengajuan layanan baru masuk!", {
            description: `Nomor: ${payload.new.request_number || 'Baru'}`,
            duration: 10000,
          });
        }
      )
      .subscribe();

    // Fallback polling every 30 seconds for metrics
    const interval = setInterval(() => {
      router.refresh();
    }, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [router, supabase]);

  return null; // Logic-only component
}
