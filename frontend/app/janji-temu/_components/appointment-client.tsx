"use client";

import AppointmentForm from "./appointment-form";

import { m } from "framer-motion";

export default function AppointmentClient() {
  return (
    <div className="w-full space-y-6">
      {/* Main Glassmorphism Display Box */}
      <div className="relative isolate rounded-3xl border border-white/20 bg-white/60 p-6 shadow-2xl backdrop-blur-xl sm:p-8 md:p-10 overflow-hidden">
        {/* Glow accent wrapper to prevent overflow scrollbars while keeping dropdowns unclipped */}
        <div className="absolute inset-0 -z-10 overflow-hidden rounded-3xl pointer-events-none">
          <div className="absolute -left-16 -top-16 h-72 w-72 rounded-full bg-emerald-500/10 blur-[100px]" />
          <div className="absolute -bottom-16 -right-16 h-72 w-72 rounded-full bg-teal-500/10 blur-[100px]" />
        </div>

        <m.div 
          className="w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">
              Formulir Pengajuan Janji Temu
            </h2>
            <p className="mt-2 text-sm text-slate-500 md:text-base">
              Silakan jadwalkan janji temu Anda dengan Kepala Kantor, Kasubag TU, atau Kepala Seksi/Kasi Kemenag Barito Utara.
            </p>
          </div>

          <AppointmentForm />
        </m.div>
      </div>
    </div>
  );
}
