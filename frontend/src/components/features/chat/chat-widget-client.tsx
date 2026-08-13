import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { ChatWidget } from "@/components/features/chat/ChatWidget";

export function ChatWidgetClient({ initialEnabled = true }: { initialEnabled?: boolean }) {
  const [pathname, setPathname] = useState("");
  const [isEnabled, setIsEnabled] = useState(initialEnabled);

  useEffect(() => {
    setPathname(window.location.pathname);
  }, []);

  useEffect(() => {
    setIsEnabled(initialEnabled);
  }, [initialEnabled]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('system_status_changes_chat')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ptsp_system_status',
          filter: 'id=eq.maintenance'
        },
        (payload) => {
          if (payload.new && payload.new.ai_chat_enabled !== undefined) {
            setIsEnabled(payload.new.ai_chat_enabled);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (pathname === "/maintenance" || !isEnabled) {
    return null;
  }

  return <ChatWidget />;
}
