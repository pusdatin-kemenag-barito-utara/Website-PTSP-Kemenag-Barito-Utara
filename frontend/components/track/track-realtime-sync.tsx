"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function TrackRealtimeSync({ 
  requestId 
}: { 
  requestId: string 
}) {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (!requestId) return;

    // Listen for changes to both service_requests and activity_logs for this specific request
    const requestChannel = supabase
      .channel(`sync_${requestId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "service_requests",
          filter: `id=eq.${requestId}`,
        },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "activity_logs",
          filter: `request_id=eq.${requestId}`,
        },
        () => router.refresh()
      )
      .subscribe();

    // Fallback Polling (Every 5 seconds)
    // This ensures that even if Realtime is not enabled in the Supabase Dashboard,
    // the page will still auto-update.
    const interval = setInterval(() => {
      router.refresh();
    }, 10000); // 10s fallback polling

    // Cleanup subscription and interval on unmount
    return () => {
      supabase.removeChannel(requestChannel);
      clearInterval(interval);
    };
  }, [requestId, router, supabase]);

  return null; // This is a logic-only component, it renders nothing
}
