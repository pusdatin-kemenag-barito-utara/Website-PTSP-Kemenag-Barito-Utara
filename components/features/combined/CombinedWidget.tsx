"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { m, AnimatePresence } from "framer-motion";
import { ChatBody } from "@/components/features/chat/ChatBody";

// ─── WhatsApp Icon ────────────────────────────────────────────────────────────
function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ─── Bot Icon ─────────────────────────────────────────────────────────────────
function BotIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  );
}

// ─── WhatsApp Content ─────────────────────────────────────────────────────────
const WA_NUMBER = "6285117491212";
const WA_MESSAGE = encodeURIComponent(
  "Halo, saya ingin bertanya mengenai layanan PTSP Kemenag Barito Utara."
);

function WhatsAppContent() {
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      {/* WA Header */}
      <div style={{ background: "#075E54", padding: "16px 18px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <div className="relative shrink-0">
          <div style={{ width: 40, height: 40, background: "rgba(255,255,255,0.12)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <Image src="/kemenag.svg" alt="Logo Kemenag" width={32} height={32} style={{ width: 32, height: 32 }} priority />
          </div>
          {/* Online dot */}
          <span style={{ position: "absolute", bottom: 1, right: 1, width: 11, height: 11, background: "#25D366", borderRadius: "50%", border: "2px solid #075E54" }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>PTSP Kemenag Barito Utara</p>
          <p style={{ color: "#25D366", fontSize: 11, fontWeight: 600, marginTop: 2 }}>WhatsApp SI-ATAK</p>
        </div>
      </div>

      {/* Chat bubble area */}
      <div style={{ background: "#E5DDD5", padding: "20px 16px", flex: 1 }}>
        <div style={{ position: "relative", background: "#fff", borderRadius: "0 14px 14px 14px", padding: "12px 14px", maxWidth: "90%", boxShadow: "0 1px 2px rgba(0,0,0,0.12)" }}>
          {/* Triangle */}
          <div style={{ position: "absolute", top: 0, left: -8, width: 0, height: 0, borderRight: "8px solid #fff", borderTop: "8px solid transparent" }} />
          <p style={{ color: "#075E54", fontSize: 12, fontWeight: 700, marginBottom: 6 }}>PTSP Kemenag Barito Utara</p>
          <p style={{ color: "#374151", fontSize: 13, lineHeight: 1.55 }}>
            Selamat datang di WhatsApp SI-ATAK PTSP Kemenag Barito Utara. 🙏
            <br /><br />
            Ada yang bisa kami bantu?
          </p>
          <p style={{ color: "#9CA3AF", fontSize: 10, textAlign: "right", marginTop: 6 }}>
            {new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>

      {/* CTA Button */}
      <div style={{ background: "#fff", padding: "14px 16px", flexShrink: 0 }}>
        <a
          href={`https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "linear-gradient(135deg, #25D366 0%, #1ebe5d 100%)", color: "#fff", fontWeight: 700, fontSize: 14, padding: "12px 0", borderRadius: 50, textDecoration: "none", boxShadow: "0 4px 12px rgba(37,211,102,0.35)", transition: "all 0.15s" }}
          className="active:scale-[0.98]"
        >
          <WhatsAppIcon size={18} />
          Kirim Pesan
        </a>
      </div>
    </div>
  );
}

// ─── Main Combined Widget ─────────────────────────────────────────────────────
interface CombinedWidgetProps {
  aiEnabled?: boolean;
}

export function CombinedWidget({ aiEnabled = true }: CombinedWidgetProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"whatsapp" | "chat">("whatsapp");

  useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted) return null;

  return (
    <>
      {/* ── Backdrop Blur Overlay ──────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setIsOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9990,
              background: "rgba(10, 20, 30, 0.4)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              cursor: "pointer",
            }}
          />
        )}
      </AnimatePresence>

      <div style={{ position: "fixed", bottom: 20, right: 16, zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
        {/* ── Panel ───────────────────────────────────────────────── */}
        <AnimatePresence>
          {isOpen && (
            <m.div
              initial={{ opacity: 0, scale: 0.88, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 16 }}
              transition={{ type: "spring", damping: 26, stiffness: 320, mass: 0.8 }}
              style={{
                width: "min(360px, calc(100vw - 32px))",
                height: 520,
                background: "#ffffff",
                borderRadius: 20,
                boxShadow: "0 24px 80px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.06)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                transformOrigin: "bottom right",
              }}
            >
              {/* Tab Bar */}
              <div style={{ display: "flex", background: "#f7f7f7", borderBottom: "1px solid rgba(0,0,0,0.08)", padding: "4px", gap: 4 }}>
                {/* WA Tab */}
                <button
                  onClick={() => setActiveTab("whatsapp")}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 7,
                    padding: "10px 0",
                    borderRadius: 16,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 600,
                    transition: "all 0.2s",
                    background: activeTab === "whatsapp" ? "#25D366" : "transparent",
                    color: activeTab === "whatsapp" ? "#fff" : "rgba(0,0,0,0.45)",
                  }}
                >
                  <WhatsAppIcon size={16} />
                  WhatsApp SI-ATAK
                </button>

                {/* Chat AI Tab */}
                {aiEnabled && (
                  <button
                    onClick={() => setActiveTab("chat")}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 7,
                      padding: "10px 0",
                      borderRadius: 16,
                      border: "none",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 600,
                      transition: "all 0.2s",
                      background: activeTab === "chat" ? "#075E54" : "transparent",
                      color: activeTab === "chat" ? "#fff" : "rgba(0,0,0,0.45)",
                    }}
                  >
                    <BotIcon size={16} />
                    Chat AI
                  </button>
                )}
              </div>

              {/* Tab Content */}
              <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0 }}>
                {activeTab === "whatsapp" ? (
                  <WhatsAppContent />
                ) : (
                  aiEnabled && <ChatBody onClose={() => setIsOpen(false)} />
                )}
              </div>
            </m.div>
          )}
        </AnimatePresence>

        {/* ── FAB Button ──────────────────────────────────────────── */}
        <m.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          style={{
            position: "relative",
            width: 60,
            height: 60,
            borderRadius: "50%",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
          }}
          aria-label={isOpen ? "Tutup widget" : "Buka chat & WhatsApp"}
          aria-expanded={isOpen}
        >
          <Image
            src="/kemenag.svg"
            alt="Kemenag"
            width={40}
            height={40}
            style={{ width: "auto", height: "auto" }}
            priority
            loading="eager"
          />
          {/* Notification dot — blink/pulse saat tertutup */}
          {!isOpen && (
            <span style={{ position: "absolute", top: 0, right: 0, width: 14, height: 14, background: "#ef4444", borderRadius: "50%", border: "2.5px solid #fff", animation: "pulseDot 1.8s ease-in-out infinite" }} />
          )}
        </m.button>

        {/* CSS: pulse animation for FAB */}
        <style jsx global>{`
          @keyframes pulseDot {
            0%, 100% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(239,68,68,0.5); }
            50% { transform: scale(1.15); opacity: 0.9; box-shadow: 0 0 0 5px rgba(239,68,68,0); }
          }
        `}</style>
      </div>
    </>
  );
}
