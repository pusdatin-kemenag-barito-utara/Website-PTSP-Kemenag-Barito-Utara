"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const ChatWidgetInner = dynamic(
  () =>
    import("@/components/features/chat/ChatWidget").then((m) => m.ChatWidget),
  { ssr: false },
);

export function ChatWidgetClient() {
  const pathname = usePathname();
  
  if (pathname === "/maintenance") {
    return null;
  }

  return <ChatWidgetInner />;
}
