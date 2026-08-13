import { getClientApiBase } from "@/lib/client-api";
import React, { useState, useRef, useEffect } from "react";


// ─── Inline SVG Icons ───────────────────────────────────────────────────────
const IconX = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconRefresh = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

const IconSend = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const IconTrash = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

interface Message {
  role: "assistant" | "user";
  content: string;
  time: Date;
}

const TypingDots = () => (
  <div className="typing-dots-container">
    {[0, 1, 2].map((i: number) => (
      <span key={i} className="typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />
    ))}
  </div>
);

// ─── Props ───────────────────────────────────────────────────────────────────
interface ChatBodyProps {
  onClose: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────
export function ChatBody({ onClose }: ChatBodyProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Halo! Saya Asisten Virtual PTSP Kemenag Barito Utara 👋\nAda yang bisa saya bantu terkait layanan kami hari ini?",
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: messageText, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(`${getClientApiBase()}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m: any) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();

      if (data.error) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.error, time: new Date() }]);
        return;
      }
      setMessages((prev) => [...prev, { role: "assistant", content: data.content, time: new Date() }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Maaf, koneksi terganggu. Silakan coba lagi sebentar lagi.", time: new Date() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        role: "assistant",
        content: "Halo! Saya Asisten Virtual PTSP Kemenag Barito Utara 👋\nAda yang bisa saya bantu terkait layanan kami hari ini?",
        time: new Date(),
      },
    ]);
    setInput("");
    setShowResetConfirm(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, fontFamily: "var(--font-jakarta), sans-serif", position: "relative", background: "#fff" }}>
      {/* Reset Confirm Overlay */}
      {showResetConfirm && (
        <div style={{ position: "absolute", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 24, width: "100%", maxWidth: 280, textAlign: "center", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }}>
            <div style={{ width: 50, height: 50, background: "rgba(239,68,68,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#ef4444" }}>
              <IconTrash />
            </div>
            <h3 style={{ color: "#111827", fontSize: 17, fontWeight: 600, marginBottom: 8 }}>Hapus Riwayat?</h3>
            <p style={{ color: "#6B7280", fontSize: 13, marginBottom: 20 }}>Seluruh percakapan Anda akan dihapus.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowResetConfirm(false)} style={{ flex: 1, padding: 10, borderRadius: 12, border: "1px solid #E5E7EB", background: "transparent", color: "#374151", cursor: "pointer" }}>Batal</button>
              <button onClick={handleReset} style={{ flex: 1, padding: 10, borderRadius: 12, border: "none", background: "#ef4444", color: "#fff", fontWeight: 600, cursor: "pointer" }}>Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* Header — sama persis dengan WA SI-ATAK */}
      <div style={{ background: "#075E54", padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <div style={{ position: "relative", width: 44, height: 48, flexShrink: 0, display: "flex", alignItems: "flex-end" }}>
          {/* White Background Circle */}
          <div style={{ position: "absolute", bottom: 0, left: 0, width: 36, height: 36, borderRadius: "50%", background: "#ffffff", border: "1.5px solid #ffffff", boxShadow: "0 2px 6px rgba(0,0,0,0.15)" }} />
          {/* Mascot Image popping out top */}
          <img src="/atak-portal.png" alt="Si ATAK Mascot" width={44} height={52} style={{ position: "absolute", bottom: 0, left: -2, width: 44, height: 52, objectFit: "contain", objectPosition: "bottom center", zIndex: 1 }} />
          {/* Online dot */}
          <span style={{ position: "absolute", bottom: 0, right: 4, width: 10, height: 10, background: "#25D366", borderRadius: "50%", border: "2px solid #075E54", zIndex: 2 }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Asisten PTSP Kemenag</p>
          <p style={{ color: "#25D366", fontSize: 11, fontWeight: 600, marginTop: 2 }}>Chat AI</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button onClick={() => setShowResetConfirm(true)} style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.12)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} className="hover:bg-white/20" title="Hapus riwayat">
            <IconTrash />
          </button>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.12)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} className="hover:bg-white/20" title="Tutup">
            <IconX />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12, background: "#E5DDD5" }}>
        {messages.map((msg: any, i: number) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start", animation: "fadeSlideIn 0.3s ease" }}>
            <div style={{ maxWidth: "85%", background: msg.role === "user" ? "#DCF8C6" : "#ffffff", borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "0 14px 14px 14px", padding: "10px 14px", color: "#1f2937", fontSize: 13, lineHeight: 1.55, whiteSpace: "pre-wrap", boxShadow: "0 1px 2px rgba(0,0,0,0.12)" }}>
              {typeof msg.content === "string" ? msg.content.replaceAll("**", "") : msg.content}
            </div>
          </div>
        ))}
        {isLoading && <TypingDots />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
        style={{ padding: 16, background: "#f0f0f0", borderTop: "1px solid rgba(0,0,0,0.08)", display: "flex", gap: 10, flexShrink: 0 }}
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tulis pesan..."
          disabled={isLoading}
          style={{ flex: 1, background: "#fff", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 14, padding: "12px 16px", color: "#111827", outline: "none", fontSize: 13 }}
          className="focus:border-emerald-500/50 transition-colors"
        />
        <button type="submit" disabled={!input.trim() || isLoading} style={{ width: 48, height: 48, borderRadius: 14, border: "none", background: "#25D366", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }} className="hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
          <IconSend />
        </button>
      </form>

      {/* CSS Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .typing-dots-container { display: flex; align-items: center; gap: 4px; padding: 4px 0; }
        .typing-dot { width: 7px; height: 7px; border-radius: 50%; background: #075E54; display: inline-block; animation: typingBounce 1.2s ease-in-out infinite; }
      ` }} />
    </div>
  );
}
