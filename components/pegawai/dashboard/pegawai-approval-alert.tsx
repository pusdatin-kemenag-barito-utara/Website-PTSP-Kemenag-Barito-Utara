"use client";

import { motion, Variants } from "framer-motion";
import { Users, UserCheck } from "lucide-react";
import Link from "next/link";

const alertVariants: Variants = {
  hidden: { opacity: 0, y: -20, height: 0 },
  show: {
    opacity: 1,
    y: 0,
    height: "auto",
    transition: { type: "spring", stiffness: 120, damping: 16 },
  },
};

export function PegawaiApprovalAlert({
  isPejabat,
  pendingAtasanCount,
  pendingKepalaCount,
}: {
  isPejabat: boolean;
  pendingAtasanCount: number;
  pendingKepalaCount: number;
}) {
  if (!isPejabat || (pendingAtasanCount === 0 && pendingKepalaCount === 0)) {
    return null;
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      className="space-y-2 sm:space-y-3"
    >
      {pendingAtasanCount > 0 && (
        <motion.div
          variants={alertVariants}
          className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg"
        >
          <div className="relative z-10 flex items-center gap-2 sm:gap-4 p-3 sm:p-5">
            <div className="flex h-7 w-7 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-md">
              <Users className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-xs sm:text-lg leading-tight">
                {pendingAtasanCount} pengajuan menunggu persetujuan Atasan
              </p>
              <p className="mt-0.5 text-[10px] sm:text-sm text-amber-100 hidden sm:block">
                Segera review pengajuan yang masuk untuk menghindari penundaan.
              </p>
            </div>
            <Link
              href="/pegawai/layanan/verifikasi"
              className="shrink-0 inline-flex items-center gap-1 rounded-lg sm:rounded-xl bg-white/20 px-2.5 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-sm font-bold backdrop-blur-md hover:bg-white/30 transition-all active:scale-95"
            >
              Tinjau
            </Link>
          </div>
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
        </motion.div>
      )}

      {pendingKepalaCount > 0 && (
        <motion.div
          variants={alertVariants}
          className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg"
        >
          <div className="relative z-10 flex items-center gap-2 sm:gap-4 p-3 sm:p-5">
            <div className="flex h-7 w-7 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-md">
              <UserCheck className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-xs sm:text-lg leading-tight">
                {pendingKepalaCount} pengajuan menunggu Kepala Kantor
              </p>
              <p className="mt-0.5 text-[10px] sm:text-sm text-blue-100 hidden sm:block">
                Pengajuan sudah melalui atasan langsung dan menunggu keputusan akhir.
              </p>
            </div>
            <Link
              href="/pegawai/layanan/verifikasi"
              className="shrink-0 inline-flex items-center gap-1 rounded-lg sm:rounded-xl bg-white/20 px-2.5 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-sm font-bold backdrop-blur-md hover:bg-white/30 transition-all active:scale-95"
            >
              Tinjau
            </Link>
          </div>
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
        </motion.div>
      )}
    </motion.div>
  );
}
