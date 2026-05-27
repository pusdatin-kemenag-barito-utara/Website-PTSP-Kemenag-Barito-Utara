"use client";

import dynamic from "next/dynamic";

const ChatWidgetInner = dynamic(
  () =>
    import("@/components/features/chat/ChatWidget").then((m) => m.ChatWidget),
  { ssr: false },
);

export function ChatWidgetClient() {
  return <ChatWidgetInner />;
}
