import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { CombinedWidget } from "@/components/features/combined/CombinedWidget";

export function CombinedWidgetClient({ initialEnabled = true }: { initialEnabled?: boolean }) {
  const [pathname, setPathname] = useState("");
  const [isEnabled, setIsEnabled] = useState(initialEnabled);

  useEffect(() => {
    setPathname(window.location.pathname);
  }, []);

  useEffect(() => {
    setIsEnabled(initialEnabled);
  }, [initialEnabled]);

  useEffect(() => {
    let channel: ReturnType<ReturnType<typeof createClient>["channel"]> | null = null;
    const timer = setTimeout(() => {
      const supabase = createClient();
      channel = supabase
        .channel("system_status_changes_combined")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "ptsp_system_status",
            filter: "id=eq.maintenance",
          },
          (payload) => {
            if (payload.new && payload.new.ai_chat_enabled !== undefined) {
              setIsEnabled(payload.new.ai_chat_enabled);
            }
          }
        )
        .subscribe();
    }, 2000);

    return () => {
      clearTimeout(timer);
      if (channel) {
        const supabase = createClient();
        supabase.removeChannel(channel);
      }
    };
  }, []);

  if (pathname === "/maintenance") return null;

  return <CombinedWidget aiEnabled={isEnabled} />;
}
