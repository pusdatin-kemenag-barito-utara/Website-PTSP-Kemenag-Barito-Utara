"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";

export function BannerModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
          {/* Backdrop */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/65 backdrop-blur-sm cursor-pointer"
            aria-label="Tutup modal"
          />

          {/* Modal Container — flex col: tombol → gambar → hint text */}
          <m.div
            initial={{ scale: 0.88, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.93, opacity: 0, y: 12 }}
            transition={{ type: "spring", damping: 28, stiffness: 320, mass: 0.8 }}
            className="relative w-full max-w-5xl z-10 flex flex-col gap-2.5"
          >
            {/* Baris atas: tombol Tutup — di luar gambar, rata kanan */}
            <div className="flex justify-end">
              <button
                onClick={handleClose}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-white/15 hover:bg-white/25 active:scale-95 text-white text-sm font-medium rounded-full transition-all duration-150 backdrop-blur-md border border-white/20 shadow-sm"
                aria-label="Tutup banner"
              >
                <X className="w-3.5 h-3.5" />
                <span>Tutup</span>
              </button>
            </div>

            {/* Gambar Banner — tanpa card wrapper, langsung float */}
            <div className="w-full rounded-xl overflow-hidden shadow-[0_32px_72px_-8px_rgba(0,0,0,0.6)]">
              <Image
                src="/banners/zona-integritas.jpg"
                alt="Zona Integritas - Wilayah Bebas dari Korupsi"
                width={1920}
                height={480}
                quality={82}
                priority
                className="w-full h-auto object-contain block"
              />
            </div>

            {/* Hint text — tanpa background, langsung di bawah gambar */}
            <p className="text-center text-xs text-white/60 select-none">
              Klik di luar atau tekan{" "}
              <span className="font-semibold text-white/85">Tutup</span>{" "}
              untuk menutup
            </p>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
