"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";

export function BannerModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Kasih sedikit delay agar animasinya halus saat halaman baru dimuat
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
          {/* Backdrop (klik di luar banner untuk menutup) */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            aria-label="Tutup modal"
          />

          {/* Banner Container */}
          <m.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-6xl bg-white rounded-2xl overflow-hidden shadow-2xl z-10 flex flex-col"
          >
            {/* Tombol Close */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2 bg-black/40 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-md shadow-sm"
              aria-label="Tutup banner"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Gambar Banner */}
            <div className="relative w-full flex items-center justify-center bg-slate-50">
              <Image
                src="/banners/zona-integritas.jpg"
                alt="Zona Integritas - Wilayah Bebas dari Korupsi"
                width={1920}
                height={480}
                quality={95}
                priority
                className="w-full h-auto object-contain rounded-2xl"
              />
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
