"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, X, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface AppointmentSuccessModalData {
  guestName: string;
  intendedOfficer: string;
  purpose: string;
  appointmentDate: string;
  appointmentTime: string;
  institutionName?: string | null;
}

interface AppointmentSuccessModalProps {
  data: AppointmentSuccessModalData | null;
  onClose: () => void;
}

export function AppointmentSuccessModal({ data, onClose }: AppointmentSuccessModalProps) {
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

  const [y, m, d] = data.appointmentDate.split("-").map(Number);
  const formattedDate = new Date(y, m - 1, d).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 0 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[85vh] border border-slate-100 hide-scrollbar"
        >
          {/* Header */}
          <div className="relative bg-emerald-600 p-5 sm:p-6 text-white text-center shrink-0">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mx-auto w-12 h-12 bg-white/15 rounded-full flex items-center justify-center text-white mb-3">
              <CheckCircle2 className="w-7 h-7 stroke-[2]" />
            </div>

            <h3 className="text-lg font-bold">Janji Temu Berhasil Dicatat</h3>
            <p className="text-xs text-emerald-100 mt-1">
              Permohonan Anda sedang dalam antrean konfirmasi petugas
            </p>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed text-center">
              Halo <strong className="text-slate-900 font-semibold">{data.guestName}</strong>, permohonan janji temu Anda telah kami terima dengan rincian berikut:
            </p>

            {/* Detail List */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 divide-y divide-slate-100 text-xs sm:text-sm">
              <div className="flex items-start justify-between py-2 first:pt-0 gap-4">
                <span className="text-slate-400 font-medium shrink-0">Bertemu</span>
                <span className="font-semibold text-slate-800 text-right">{data.intendedOfficer}</span>
              </div>

              <div className="flex items-start justify-between py-2 gap-4">
                <span className="text-slate-400 font-medium shrink-0">Jadwal</span>
                <span className="font-semibold text-slate-800 text-right">{formattedDate} ({data.appointmentTime} WIB)</span>
              </div>

              {data.institutionName && (
                <div className="flex items-start justify-between py-2 gap-4">
                  <span className="text-slate-400 font-medium shrink-0">Instansi/Lembaga</span>
                  <span className="font-semibold text-slate-800 text-right">{data.institutionName}</span>
                </div>
              )}

              <div className="flex items-start justify-between py-2 gap-4">
                <span className="text-slate-400 font-medium shrink-0">Keperluan</span>
                <span className="font-medium text-slate-700 text-right line-clamp-2">{data.purpose}</span>
              </div>

              <div className="flex items-center justify-between py-2 last:pb-0 gap-4">
                <span className="text-slate-400 font-medium shrink-0">Status</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60">
                  <Clock className="w-3 h-3 text-amber-500" />
                  Menunggu Konfirmasi Admin
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center leading-normal">
              Status persetujuan janji temu akan dikonfirmasi oleh petugas/admin kantor.
            </p>

            {/* Action Button */}
            <div className="pt-1">
              <Button
                onClick={onClose}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <span>Selesai & Tutup</span>
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
