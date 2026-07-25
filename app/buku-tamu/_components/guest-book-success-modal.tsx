"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import { GuestEntry } from "./types";

export interface GuestBookSuccessModalData {
  guestName: string;
  intendedOfficer: string;
  purpose: string;
  visitDate: string;
  institutionName?: string | null;
  entry?: GuestEntry;
}

interface GuestBookSuccessModalProps {
  data: GuestBookSuccessModalData | null;
  onClose: () => void;
}

export function GuestBookSuccessModal({ data, onClose }: GuestBookSuccessModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (data) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [data]);

  if (!data || !mounted) return null;

  const formattedDate = new Date(data.visitDate).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedTime = new Date(data.visitDate).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-md overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 0 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[85vh] border border-slate-100 hide-scrollbar my-auto"
        >
          {/* Header */}
          <div className="relative bg-emerald-600 p-5 sm:p-6 text-white text-center shrink-0">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Check Icon */}
            <div className="mx-auto w-12 h-12 bg-white/15 rounded-full flex items-center justify-center text-white mb-3">
              <CheckCircle2 className="w-7 h-7 stroke-[2]" />
            </div>

            <h3 className="text-lg font-bold">Kunjungan Berhasil Dicatat</h3>
            <p className="text-xs text-emerald-100 mt-1">
              Terima kasih telah mengisi buku tamu PTSP Kemenag Barito Utara
            </p>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-4">
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed text-center">
              Halo <strong className="text-slate-900 font-semibold">{data.guestName}</strong>, data kunjungan Anda telah tersimpan dengan rincian sebagai berikut:
            </p>

            {/* Clean Detail List */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 divide-y divide-slate-100 text-xs sm:text-sm">
              <div className="flex items-start justify-between py-2 first:pt-0 gap-4">
                <span className="text-slate-400 font-medium shrink-0">Tujuan</span>
                <span className="font-semibold text-slate-800 text-right">{data.intendedOfficer}</span>
              </div>

              <div className="flex items-start justify-between py-2 gap-4">
                <span className="text-slate-400 font-medium shrink-0">Waktu</span>
                <span className="font-semibold text-slate-800 text-right">{formattedDate} ({formattedTime} WIB)</span>
              </div>

              {data.institutionName && (
                <div className="flex items-start justify-between py-2 gap-4">
                  <span className="text-slate-400 font-medium shrink-0">Instansi</span>
                  <span className="font-semibold text-slate-800 text-right">{data.institutionName}</span>
                </div>
              )}

              <div className="flex items-start justify-between py-2 last:pb-0 gap-4">
                <span className="text-slate-400 font-medium shrink-0">Keperluan</span>
                <span className="font-medium text-slate-700 text-right line-clamp-2">{data.purpose}</span>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-1">
              <Button
                onClick={onClose}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <span>Selesai & Lihat Daftar</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
