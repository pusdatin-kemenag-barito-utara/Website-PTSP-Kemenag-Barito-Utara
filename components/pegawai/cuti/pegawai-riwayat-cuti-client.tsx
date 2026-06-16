"use client";

import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  CalendarRange,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CutiActions } from "@/components/ui/cuti-actions";
import { CutiDraftButton } from "@/components/ui/cuti-draft-button";

interface CutiItem {
  id: string;
  jenisCuti: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  tanggalPilihan: string | null;
  alasan: string;
  status: string;
  statusAtasan: string;
  statusKepala: string;
  catatanAtasan: string | null;
  catatanKepala: string | null;
  unitKerja: string | null;
  createdAt: Date;
  masaKerjaTahun: string | null;
  masaKerjaBulan: string | null;
  noHp: string | null;
  alamatCuti: string | null;
  jenisPegawai: string | null;
  ttdPemohon: string | null;
  ttdAtasan: string | null;
  ttdKepala: string | null;
  dokumenUrl: string | null;
  editCount: number;
}

interface Profile {
  fullName: string | null;
  email: string | null;
  unitKerja: string | null;
  nip: string | null;
  jabatan: string | null;
  sisaCuti?: number | null;
  cutiTahun2?: number | null;
  cutiTahun1?: number | null;
  hakBerjalan?: number | null;
  jumlahCuti?: number | null;
  totalDiambil?: number;
  cutiAlasanPenting?: number | null;
  cutiBesar?: number | null;
  cutiBersalin?: number | null;
  cutiSakit?: number | null;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 18 },
  },
};

function getStatusBadge(status: string, statusAtasan: string) {
  if (status === "approved") {
    return { icon: CheckCircle2, label: "Disetujui", cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20" };
  }
  if (status === "rejected") {
    return { icon: XCircle, label: "Tidak Disetujui", cls: "bg-rose-50 text-rose-700 ring-1 ring-rose-600/20" };
  }
  if (statusAtasan !== "pending") {
    return { icon: Clock, label: "Menunggu Kepala Kantor", cls: "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20" };
  }
  return { icon: Clock, label: "Menunggu Atasan", cls: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20" };
}

export function PegawaiRiwayatCutiClient({
  items,
  profile,
  pejabatList,
}: {
  items: CutiItem[];
  profile: Profile | null;
  pejabatList: any[];
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (items.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Header />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 text-center flex flex-col items-center"
        >
          <div className="h-12 w-12 sm:h-16 sm:w-16 bg-slate-50 rounded-full flex items-center justify-center mb-3 sm:mb-4">
            <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">Belum Ada Pengajuan</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm">
            Anda belum pernah mengajukan cuti. Klik tombol &quot;Ajukan Cuti Baru&quot; untuk mulai membuat permohonan.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Header />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-2 sm:space-y-3"
      >
        {items.map((cuti) => {
          const isOpen = expandedId === cuti.id;
          const badge = getStatusBadge(cuti.status, cuti.statusAtasan);
          const BadgeIcon = badge.icon;

          return (
            <motion.div
              key={cuti.id}
              variants={itemVariants}
              className={`rounded-xl sm:rounded-2xl border transition-all ${
                isOpen
                  ? "border-emerald-200 shadow-md"
                  : "border-slate-200 shadow-sm hover:border-slate-300"
              } bg-white overflow-hidden`}
            >
              {/* Compact Header — always visible */}
              <button
                onClick={() => toggleExpand(cuti.id)}
                className="w-full flex items-center gap-2 sm:gap-3 p-2.5 sm:p-4 text-left transition-colors hover:bg-slate-50/50"
              >
                <div className={`flex h-7 w-7 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg sm:rounded-xl ${
                  cuti.status === "approved"
                    ? "bg-emerald-50 text-emerald-600"
                    : cuti.status === "rejected"
                      ? "bg-rose-50 text-rose-600"
                      : "bg-amber-50 text-amber-600"
                }`}>
                  <CalendarRange className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className="text-sm sm:text-base font-bold text-slate-900 truncate">
                      {cuti.jenisCuti}
                    </span>
                    <span className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-xs font-bold rounded-full shrink-0 ${badge.cls}`}>
                      <BadgeIcon className="h-2 w-2 sm:h-3 sm:w-3" />
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-sm text-slate-500 mt-0.5">
                    {format(new Date(cuti.tanggalMulai), "dd MMM", { locale: id })}
                    {" — "}
                    {format(new Date(cuti.tanggalSelesai), "dd MMM yyyy", { locale: id })}
                  </p>
                </div>

                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="shrink-0 text-slate-400"
                >
                  <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
                </motion.div>
              </button>

              {/* Expanded Content */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-slate-100 px-2.5 pb-2.5 sm:px-4 sm:pb-4 pt-2 sm:pt-3 space-y-2 sm:space-y-3">
                      {/* Alasan */}
                      <div>
                        <span className="text-[11px] sm:text-sm font-medium text-slate-500 block mb-0.5 sm:mb-1">
                          Alasan:
                        </span>
                        <p className="text-xs sm:text-sm leading-relaxed text-slate-700 bg-slate-50 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                          {cuti.alasan}
                        </p>
                      </div>

                      {/* Detail tanggal */}
                      <div className="grid grid-cols-2 gap-2 sm:gap-3 text-[11px] sm:text-sm">
                        <div>
                          <span className="text-slate-500 font-medium block mb-0.5">Tanggal Cuti</span>
                          <span className="font-semibold text-slate-700">
                            {format(new Date(cuti.tanggalMulai), "dd MMM yyyy", { locale: id })}
                            {" — "}
                            {format(new Date(cuti.tanggalSelesai), "dd MMM yyyy", { locale: id })}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-medium block mb-0.5">Diajukan Pada</span>
                          <span className="font-semibold text-slate-700">
                            {format(new Date(cuti.createdAt), "dd MMM yyyy HH:mm", { locale: id })}
                          </span>
                        </div>
                      </div>

                      {/* Catatan Atasan */}
                      {cuti.catatanAtasan && (
                        <div className="flex items-start gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-blue-50 border border-blue-100">
                          <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-blue-700 text-[10px] sm:text-xs font-bold block mb-0.5">Catatan Atasan Langsung:</span>
                            <p className="text-blue-800 text-xs sm:text-sm italic">{cuti.catatanAtasan}</p>
                          </div>
                        </div>
                      )}

                      {/* Catatan Kepala */}
                      {cuti.catatanKepala && (
                        <div className="flex items-start gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-emerald-50 border border-emerald-100">
                          <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-emerald-700 text-[10px] sm:text-xs font-bold block mb-0.5">Catatan Kepala Kantor:</span>
                            <p className="text-emerald-800 text-xs sm:text-sm italic">{cuti.catatanKepala}</p>
                          </div>
                        </div>
                      )}

                      {/* Approved Message */}
                      {cuti.status === "approved" && (
                        <div className="flex items-start gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-emerald-50 border border-emerald-200">
                          <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 shrink-0 mt-0.5" />
                          <p className="text-emerald-800 text-xs sm:text-sm font-medium">
                            Pengajuan cuti Anda telah disetujui. Surat cuti sedang dalam proses pembuatan oleh Admin PTSP.
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-row items-center justify-between pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-slate-100">
                        <CutiDraftButton cuti={cuti} profile={profile} pejabatList={pejabatList} />
                        <CutiActions id={cuti.id} status={cuti.status} editCount={cuti.editCount} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

function Header() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
      <div>
        <h1 className="text-xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2 sm:gap-3">
          <CalendarRange className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600" />
          Riwayat Cuti
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5 sm:mt-1">
          Daftar pengajuan cuti Anda beserta statusnya
        </p>
      </div>
      <Link
        href="/pegawai/cuti/tambah"
        className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-[#059669] to-[#047857] hover:from-emerald-600 hover:to-emerald-700 text-white text-sm sm:text-base font-bold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all active:scale-95"
      >
        <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
        Ajukan Cuti Baru
      </Link>
    </div>
  );
}
