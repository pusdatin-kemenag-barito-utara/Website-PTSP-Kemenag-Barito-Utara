"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const ChatWidgetInner = dynamic(
  () =>
    import("@/components/features/chat/ChatWidget").then((m) => m.ChatWidget),
  { ssr: false },
);

export function ChatWidgetClient({ initialEnabled = true }: { initialEnabled?: boolean }) {
  const pathname = usePathname();
  const [isEnabled, setIsEnabled] = useState(initialEnabled);

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

  return <ChatWidgetInner />;
}
