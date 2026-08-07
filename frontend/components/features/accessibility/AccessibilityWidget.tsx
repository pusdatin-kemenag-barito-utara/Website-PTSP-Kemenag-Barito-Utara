"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";


// ─── Icons ───────────────────────────────────────────────────────────────────

const IconWheelchair = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <circle cx="14" cy="4" r="2.25" />
    <path d="M20 12.5a.75.75 0 0 1-.75.75H14.5l-1.6 3.6a.75.75 0 0 1-1.37-.6l1.37-3.1h-4.32l-1.9-4.22a.75.75 0 0 1 1.36-.62L9.4 11.5h4.1l1.83-4.1a.75.75 0 0 1 1.37.6l-1.4 3.15h3.95a.75.75 0 0 1 .75.75z" />
    <path d="M12 20a6.5 6.5 0 1 1 5.9-3.76.75.75 0 0 1-1.37-.6A5 5 0 1 0 12 18.5a4.97 4.97 0 0 0 3.54-1.46.75.75 0 0 1 1.06 1.06A6.47 6.47 0 0 1 12 20z" />
  </svg>
);

const IconClose = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const IconContrast = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 2a10 10 0 0 1 0 20z" fill="currentColor" stroke="none"/>
  </svg>
);

const IconGrayscale = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/><path d="M12 2v20"/>
  </svg>
);

const IconUnderline = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="4" y1="20" x2="20" y2="20"/>
  </svg>
);

const IconCursor = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M4 0l16 12.28-6.95 1.02 4.33 8.7-3.9 1.94L9.06 15.7 4 18.76z"/>
  </svg>
);

const IconFont = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>
  </svg>
);

const IconInvert = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2v20M12 2a10 10 0 1 1 0 20z" fill="currentColor"/>
  </svg>
);

const IconLegibleFont = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 19V6.5a2.5 2.5 0 0 1 5 0V19"/>
    <path d="M4 13h5"/>
    <path d="M14 19v-6a2.5 2.5 0 0 1 5 0v6"/>
    <path d="M14 16h5"/>
  </svg>
);

const IconHighlight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
  </svg>
);

const IconArrowUp = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
  </svg>
);

const IconSpeaker = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

// ─── Settings Types & Helpers ────────────────────────────────────────────────
const STORAGE_KEY = "a11y_settings";

interface A11ySettings {
  highContrast: boolean;
  grayscale: boolean;
  invert: boolean;
  underlineLinks: boolean;
  legibleFont: boolean;
  highlightHeaders: boolean;
  largeCursor: boolean;
  screenReaderHover: boolean;
  fontSize: number;
}

const defaultSettings: A11ySettings = {
  highContrast: false,
  grayscale: false,
  invert: false,
  underlineLinks: false,
  legibleFont: false,
  highlightHeaders: false,
  largeCursor: false,
  screenReaderHover: false,
  fontSize: 100,
};

function loadSettings(): A11ySettings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

function saveSettings(s: A11ySettings) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

function applySettings(s: A11ySettings) {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  html.classList.toggle("a11y-high-contrast", s.highContrast);
  html.classList.toggle("a11y-grayscale", s.grayscale);
  html.classList.toggle("a11y-invert", s.invert);
  html.classList.toggle("a11y-underline-links", s.underlineLinks);
  html.classList.toggle("a11y-legible-font", s.legibleFont);
  html.classList.toggle("a11y-highlight-headers", s.highlightHeaders);
  html.classList.toggle("a11y-large-cursor", s.largeCursor);
  html.style.fontSize = s.fontSize !== 100 ? `${s.fontSize}%` : "";
}

// ─── Sub-components ───────────────────────────────────────────────────────────
interface ToggleRowProps {
  icon: React.ReactNode;
  label: string;
  desc: string;
  checked: boolean;
  onChange: () => void;
}

function ToggleRow({ icon, label, desc, checked, onChange }: ToggleRowProps) {
  return (
    <div
      className="a11y-toggle-row"
      onClick={onChange}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onChange();
        }
      }}
    >
      <div className="a11y-toggle-info">
        <div className="a11y-toggle-icon">{icon}</div>
        <div>
          <div className="a11y-toggle-label">{label}</div>
          <div className="a11y-toggle-desc">{desc}</div>
        </div>
      </div>
      <div className="a11y-switch">
        <input type="checkbox" checked={checked} onChange={() => {}} tabIndex={-1} readOnly aria-label={label} />
        <span className="a11y-slider" />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<A11ySettings>(defaultSettings);
  const pathname = usePathname();

  // Load settings on mount
  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  // Apply + save on every change
  useEffect(() => {
    applySettings(settings);
    saveSettings(settings);
  }, [settings]);

  // Screen Reader Speech Synthesis Logic
  useEffect(() => {
    if (!settings.screenReaderHover || typeof window === "undefined") {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    let activeAudio: HTMLAudioElement | null = null;

    const speakText = (text: string) => {
      try {
        if (!text) return;

        // Stop any running speech or audio
        if (activeAudio) {
          activeAudio.pause();
          activeAudio.currentTime = 0;
          activeAudio = null;
        }
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }

        // Clean text for natural speech pronunciation (remove symbols like • | - / \ _)
        const cleanText = text
          .replace(/[•|/_\-\\]+/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        if (!cleanText || cleanText.length < 2) return;

        // Limit to 200 characters per chunk for crisp neural audio
        const ttsText = cleanText.slice(0, 200);

        // Google Neural Female Indonesian TTS Engine
        const gTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(ttsText)}&tl=id&client=tw-ob`;
        const audio = new Audio(gTtsUrl);
        activeAudio = audio;

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Fallback to Web Speech API targeting female Indonesian voice (Microsoft Gadis / Google Female)
            if ("speechSynthesis" in window) {
              const utterance = new SpeechSynthesisUtterance(cleanText);
              const voices = window.speechSynthesis.getVoices();
              const femaleIdVoice =
                voices.find(
                  (v) =>
                    (v.lang.toLowerCase().includes("id") || v.name.toLowerCase().includes("indonesia")) &&
                    (v.name.includes("Gadis") || v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Female") || v.name.includes("Wita"))
                ) ||
                voices.find(
                  (v) => v.lang.toLowerCase().includes("id") || v.name.toLowerCase().includes("indonesia")
                );

              if (femaleIdVoice) {
                utterance.voice = femaleIdVoice;
                utterance.lang = femaleIdVoice.lang;
              } else {
                utterance.lang = "id-ID";
              }
              utterance.rate = 0.98;
              utterance.pitch = 1.05;
              window.speechSynthesis.speak(utterance);
            }
          });
        }
      } catch (err) {
        console.error("Audio TTS Error:", err);
      }
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Ignore widget UI elements
      if (target.closest(".a11y-drawer") || target.closest(".a11y-tab") || target.closest(".ai-chat-window") || target.closest(".ai-fab-button")) return;

      // Find closest text element
      const textElem = target.closest("p, span, h1, h2, h3, h4, h5, h6, a, button, label, li, td, th") || target;

      const rawText = (
        textElem.getAttribute?.("aria-label") ||
        textElem.getAttribute?.("title") ||
        textElem.getAttribute?.("alt") ||
        (textElem as HTMLElement).innerText ||
        (textElem as HTMLElement).textContent ||
        ""
      ).trim();

      // Clean multiple spaces and line breaks
      const text = rawText.replace(/\s+/g, " ");

      if (text && text.length >= 2 && text.length <= 400) {
        speakText(text);
      }
    };

    document.addEventListener("click", handleClick, { capture: true });

    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [settings.screenReaderHover]);

  // Lock background body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const toggle = useCallback((key: keyof A11ySettings) => {
    setSettings((p) => ({ ...p, [key]: !p[key] }));
  }, []);

  const changeFontSize = useCallback((delta: number) => {
    setSettings((p) => ({
      ...p,
      fontSize: Math.min(150, Math.max(80, p.fontSize + delta)),
    }));
  }, []);

  const resetAll = useCallback(() => setSettings(defaultSettings), []);

  const cleanPath = pathname?.toLowerCase().trim() ?? "";
  if (
    cleanPath.startsWith("/admin") ||
    cleanPath.startsWith("/login") ||
    cleanPath.includes("/auth")
  ) return null;

  const hasActive =
    settings.highContrast ||
    settings.grayscale ||
    settings.invert ||
    settings.underlineLinks ||
    settings.legibleFont ||
    settings.highlightHeaders ||
    settings.largeCursor ||
    settings.screenReaderHover ||
    settings.fontSize !== 100;

  return (
    <>
      {/* ── Backdrop ─────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="a11y-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9994,
              background: "rgba(15, 23, 42, 0.35)",
              backdropFilter: "blur(3px)",
              WebkitBackdropFilter: "blur(3px)",
              cursor: "pointer",
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Drawer Panel ────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="a11y-drawer"
            className="a11y-drawer"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="a11y-drawer-header">
              <div className="a11y-drawer-header-icon">
                <IconWheelchair size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <h3>Aksesibilitas</h3>
                <p>Sesuaikan tampilan untuk kenyamanan Anda</p>
              </div>
              <button
                className="a11y-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Tutup panel aksesibilitas"
              >
                <IconClose />
              </button>
            </div>

            {/* Body */}
            <div className="a11y-drawer-body">
              <div className="a11y-section-label">Tampilan & Warna</div>

              <ToggleRow
                icon={<IconContrast />}
                label="Kontras Tinggi"
                desc="Meningkatkan keterbacaan teks"
                checked={settings.highContrast}
                onChange={() => toggle("highContrast")}
              />
              <ToggleRow
                icon={<IconGrayscale />}
                label="Mode Abu-abu"
                desc="Hapus warna untuk fokus teks"
                checked={settings.grayscale}
                onChange={() => toggle("grayscale")}
              />
              <ToggleRow
                icon={<IconInvert />}
                label="Balik Warna (Invert)"
                desc="Ganti skema warna gelap/terang"
                checked={settings.invert}
                onChange={() => toggle("invert")}
              />

              <div className="a11y-section-label">Keterbacaan & Navigasi</div>

              <ToggleRow
                icon={<IconUnderline />}
                label="Garis Bawah Tautan"
                desc="Tampilkan garis di semua link"
                checked={settings.underlineLinks}
                onChange={() => toggle("underlineLinks")}
              />
              <ToggleRow
                icon={<IconLegibleFont />}
                label="Font Mudah Dibaca"
                desc="Gunakan font standar bersih"
                checked={settings.legibleFont}
                onChange={() => toggle("legibleFont")}
              />
              <ToggleRow
                icon={<IconHighlight />}
                label="Sorot Judul (Heading)"
                desc="Beri garis penanda pada judul"
                checked={settings.highlightHeaders}
                onChange={() => toggle("highlightHeaders")}
              />
              <ToggleRow
                icon={<IconSpeaker />}
                label="Pembaca Layar (Klik Teks)"
                desc="Klik teks/judul untuk membacanya"
                checked={settings.screenReaderHover}
                onChange={() => toggle("screenReaderHover")}
              />
              <ToggleRow
                icon={<IconCursor />}
                label="Kursor Besar"
                desc="Perbesar ukuran kursor mouse"
                checked={settings.largeCursor}
                onChange={() => toggle("largeCursor")}
              />

              <div className="a11y-section-label">Ukuran Teks</div>

              <div className="a11y-font-row">
                <div className="a11y-font-info">
                  <div className="a11y-font-icon"><IconFont /></div>
                  <div className="a11y-font-value-wrap">
                    <div className="a11y-font-value">{settings.fontSize}%</div>
                    <div className="a11y-font-value-label">Ukuran Font</div>
                  </div>
                </div>
                <button
                  className="a11y-font-btn"
                  onClick={() => changeFontSize(-10)}
                  aria-label="Perkecil font"
                  disabled={settings.fontSize <= 80}
                >−</button>
                <button
                  className="a11y-font-btn"
                  onClick={() => changeFontSize(10)}
                  aria-label="Perbesar font"
                  disabled={settings.fontSize >= 150}
                >+</button>
              </div>

              {hasActive && (
                <motion.button
                  className="a11y-reset-btn"
                  onClick={resetAll}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  aria-label="Reset semua pengaturan aksesibilitas"
                >
                  ↺ &nbsp;Reset Semua Pengaturan
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Side Tab (Sembunyi otomatis saat panel terbuka !isOpen) ────── */}
      {!isOpen && (
        <button
          className="a11y-tab"
          onClick={() => setIsOpen(true)}
          aria-label="Buka menu aksesibilitas"
          aria-expanded={false}
          aria-haspopup="dialog"
          title="Aksesibilitas"
          style={{ zIndex: 9991 }}
        >
          {/* Active badge */}
          {hasActive && <span className="a11y-tab-badge" />}

          {/* Wheelchair icon */}
          <IconWheelchair size={20} />
        </button>
      )}
    </>
  );
}

export default AccessibilityWidget;
