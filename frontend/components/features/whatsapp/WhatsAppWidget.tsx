"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";

const WA_NUMBER = "6285117491212";
const WA_MESSAGE = encodeURIComponent(
  "Halo, saya ingin bertanya mengenai layanan PTSP Kemenag Barito Utara."
);

// Inline WhatsApp SVG icon (tidak perlu install library)
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    // Posisi: di atas chat FAB (bottom 28+60+12=100px, right 28px)
    <div
      style={{ position: "fixed", bottom: 100, right: 28, zIndex: 9998 }}
      className="flex flex-col items-end gap-3"
    >
      {/* === Popup Card === */}
      <AnimatePresence>
        {isOpen && (
          <m.div
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 12 }}
            transition={{ type: "spring", damping: 26, stiffness: 320, mass: 0.8 }}
            className="w-[300px] sm:w-[320px] rounded-2xl overflow-hidden"
            style={{
              boxShadow: "0 20px 60px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.15)",
            }}
          >
            {/* Header — dark green WhatsApp style */}
            <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                  <Image
                    src="/kemenag.svg"
                    alt="Logo Kemenag"
                    width={36}
                    height={36}
                    style={{ width: 36, height: 36 }}
                    priority
                  />
                </div>
                {/* Online indicator */}
                <span
                  className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#075E54]"
                  style={{ background: "#25D366" }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm leading-tight truncate">
                  PTSP Kemenag Barito Utara
                </p>
                <p className="text-xs font-medium" style={{ color: "#25D366" }}>
                  WhatsApp Siaga
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/60 hover:text-white p-1 rounded-full transition-colors shrink-0"
                aria-label="Tutup widget WhatsApp"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat bubble area */}
            <div className="px-4 py-5" style={{ background: "#E5DDD5" }}>
              <div className="relative bg-white rounded-xl rounded-tl-none px-3.5 py-3 max-w-[90%] shadow-sm">
                {/* Triangle sudut chat bubble */}
                <div
                  className="absolute -top-0 -left-2 w-0 h-0"
                  style={{
                    borderRight: "8px solid white",
                    borderTop: "8px solid transparent",
                    borderBottom: "0px solid transparent",
                  }}
                />
                <p className="text-xs font-semibold mb-1" style={{ color: "#075E54" }}>
                  PTSP Kemenag Barito Utara
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Selamat datang di WhatsApp Siaga PTSP Kemenag Barito Utara. 🙏
                  <br />
                  <br />
                  Ada yang bisa kami bantu?
                </p>
                <p className="text-[10px] text-gray-400 text-right mt-1.5">
                  {new Date().toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="bg-white px-4 py-3">
              <a
                href={`https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full text-white font-semibold text-sm py-3 rounded-full transition-all duration-150 active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #25D366 0%, #1ebe5d 100%)",
                  boxShadow: "0 4px 12px rgba(37, 211, 102, 0.35)",
                }}
              >
                <WhatsAppIcon className="w-5 h-5" />
                Kirim Pesan
              </a>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* === Floating Pill Button === */}
      <m.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center gap-2 text-white font-semibold text-sm rounded-full select-none"
        style={{
          padding: "10px 18px 10px 14px",
          background: "linear-gradient(135deg, #25D366 0%, #20b857 100%)",
          boxShadow:
            "0 4px 20px rgba(37, 211, 102, 0.45), 0 2px 8px rgba(0,0,0,0.15)",
        }}
        aria-label="Buka WhatsApp Siaga"
        aria-expanded={isOpen}
      >
        <WhatsAppIcon className="w-5 h-5 shrink-0" />
        <span>WhatsApp Siaga</span>

        {/* Notification dot — hilang saat popup terbuka */}
        {!isOpen && (
          <m.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white"
          />
        )}
      </m.button>
    </div>
  );
}
