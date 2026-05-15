"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";

// ─── Inline SVG Icons ───────────────────────────────────────────────────────
const IconBot = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8V4H8" />
    <rect width="16" height="12" x="4" y="8" rx="2" />
    <path d="M2 14h2" />
    <path d="M20 14h2" />
    <path d="M15 13v2" />
    <path d="M9 13v2" />
  </svg>
);

const IconX = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const IconSend = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const IconChevronDown = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const IconTrash = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const QUICK_ACTIONS = [
  "Persyaratan Daftar Haji?",
  "Syarat Rekomendasi Paspor?",
  "Biaya Nikah?",
  "Cara Sertifikasi Halal?",
  "Syarat Legalisir Ijazah?",
  "Jam Operasional PTSP?",
  "Alamat Kantor Kemenag?",
  "Cek Nomor Porsi Haji?",
];

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

export const ChatWidget = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Halo! Saya Asisten Virtual PTSP Kemenag Barito Utara 👋\nAda yang bisa saya bantu terkait layanan kami hari ini?",
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [messages, isOpen]);

  if (!isMounted) return null;

  const sendMessage = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: messageText, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setShowQuickActions(false);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m: any) => ({
            role: m.role,
            content: m.content,
          })),
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
    setMessages([{
      role: "assistant",
      content: "Halo! Saya Asisten Virtual PTSP Kemenag Barito Utara 👋\nAda yang bisa saya bantu terkait layanan kami hari ini?",
      time: new Date(),
    }]);
    setShowQuickActions(true);
    setInput("");
    setShowResetConfirm(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`ai-fab-button ${isOpen ? "hidden" : "visible"}`}
        style={{
          position: "fixed",
          zIndex: 9999,
          background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
          border: "none",
          borderRadius: "50%",
          color: "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 24px rgba(5,150,105,0.45), 0 2px 8px rgba(0,0,0,0.2)",
          animation: !isOpen ? "pulseGreen 2.5s ease-in-out infinite" : "none",
        }}
      >
        <Image src="/kemenag-512.png" alt="Kemenag" width={40} height={40} priority />
        <span style={{ position: "absolute", top: 0, right: 0, width: 14, height: 14, background: "#ef4444", borderRadius: "50%", border: "2px solid #fff" }} />
      </button>

      <div
        className={`ai-chat-window ${isOpen ? "open" : ""}`}
        style={{
          position: "fixed",
          bottom: 28,
          right: 28,
          zIndex: 9999,
          background: "rgba(10, 15, 25, 0.98)",
          backdropFilter: "blur(20px)",
          borderRadius: 28,
          boxShadow: "0 24px 80px rgba(0,0,0,0.55)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          fontFamily: "var(--font-outfit), sans-serif",
        }}
      >
        {showResetConfirm && (
          <div style={{ position: "absolute", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div style={{ background: "#1a2234", borderRadius: 20, padding: 24, width: "100%", maxWidth: 300, textAlign: "center" }}>
              <div style={{ width: 50, height: 50, background: "rgba(239,68,68,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#ef4444" }}>
                <IconTrash />
              </div>
              <h3 style={{ color: "#fff", fontSize: 17, fontWeight: 600, marginBottom: 8 }}>Hapus Riwayat?</h3>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginBottom: 20 }}>Seluruh percakapan Anda akan dihapus.</p>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowResetConfirm(false)} style={{ flex: 1, padding: 10, borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#fff" }}>Batal</button>
                <button onClick={handleReset} style={{ flex: 1, padding: 10, borderRadius: 12, border: "none", background: "#ef4444", color: "#fff", fontWeight: 600 }}>Hapus</button>
              </div>
            </div>
          </div>
        )}

        <div style={{ background: "linear-gradient(135deg, #065f46 0%, #10b981 100%)", padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, background: "rgba(255,255,255,0.15)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid rgba(255,255,255,0.2)" }}>
              <Image src="/kemenag-512.png" alt="Logo" width={32} height={32} priority />
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Asisten PTSP</div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                <span style={{ width: 7, height: 7, background: "#86efac", borderRadius: "50%", display: "inline-block" }} />
                <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 11 }}>Online</span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setShowResetConfirm(true)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                border: "none",
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.2s"
              }}
              className="hover:bg-white/20"
            >
              <IconTrash />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                border: "none",
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.2s"
              }}
              className="hover:bg-white/20"
            >
              <IconX />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.map((msg: any, i: number) => (
            <div key={i} style={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: msg.role === "user" ? "flex-end" : "flex-start",
              animation: "fadeSlideIn 0.3s ease"
            }}>
              <div style={{
                maxWidth: "85%",
                background: msg.role === "user" ? "#10b981" : "rgba(255,255,255,0.07)",
                borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                padding: "11px 14px",
                color: "#fff",
                fontSize: 13,
                lineHeight: 1.5,
                whiteSpace: "pre-wrap"
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && <TypingDots />}
          {showQuickActions && (
            <div style={{ marginTop: 8 }}>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>Pertanyaan Populer:</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {QUICK_ACTIONS.map((qa: string) => (
                  <button key={qa} onClick={() => sendMessage(qa)} style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 20, padding: "6px 12px", color: "#6ee7b7", fontSize: 11, cursor: "pointer", transition: "all 0.2s" }} className="hover:bg-emerald-500/20">{qa}</button>
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} style={{ padding: 16, background: "rgba(255,255,255,0.03)", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 10 }}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tulis pesan..."
            disabled={isLoading}
            style={{ flex: 1, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "12px 16px", color: "#fff", outline: "none", fontSize: 13 }}
            className="focus:border-emerald-500/50 transition-colors"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading} 
            style={{ 
              width: 48, 
              height: 48, 
              borderRadius: 14, 
              border: "none", 
              background: "#10b981", 
              color: "#fff", 
              cursor: "pointer", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              flexShrink: 0,
              transition: "all 0.2s"
            }}
            className="hover:bg-emerald-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IconSend />
          </button>
        </form>
      </div>

      <style jsx global>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGreen {
          0%, 100% { box-shadow: 0 4px 24px rgba(5,150,105,0.45), 0 2px 8px rgba(0,0,0,0.2); }
          50% { box-shadow: 0 4px 32px rgba(5,150,105,0.7), 0 2px 12px rgba(0,0,0,0.25); }
        }

        .ai-chat-window {
          transition: opacity 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform-origin: bottom right;
          width: 440px;
          height: 700px;
          opacity: 0;
          transform: scale(0.8) translateY(20px);
          pointer-events: none;
        }
        .ai-chat-window.open {
          opacity: 1 !important;
          transform: scale(1) translateY(0) !important;
          pointer-events: auto !important;
        }

        .ai-fab-button {
          transition: opacity 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          width: 60px; 
          height: 60px;
          bottom: 28px; 
          right: 28px;
        }
        .ai-fab-button.hidden {
          opacity: 0;
          transform: scale(0) rotate(-45deg);
          pointer-events: none;
        }
        .ai-fab-button.visible {
          opacity: 1;
          transform: scale(1) rotate(0);
          pointer-events: auto;
        }

        @media (max-width: 768px) {
          .ai-chat-window {
            width: calc(100vw - 40px);
            height: 600px;
            bottom: 20px;
            right: 20px;
          }
          .ai-fab-button {
            bottom: 20px;
            right: 20px;
            width: 52px;
            height: 52px;
          }
        }

        .typing-dots-container {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 0;
        }
        .typing-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
          display: inline-block;
          animation: typingBounce 1.2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};
