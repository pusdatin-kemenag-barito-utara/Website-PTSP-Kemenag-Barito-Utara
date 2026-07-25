"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  ClipboardList, 
  PlusCircle, 
  CalendarDays, 
  ArrowRight,
  FileCheck2,
  Edit2
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { LkhModal } from "@/components/pegawai/e-lk/lkh-modal";

interface ElkhHarianClientProps {
  recentLkh: any[];
}

export function ElkhHarianClient({ recentLkh }: ElkhHarianClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLkh, setSelectedLkh] = useState<any>(null);

  const today = new Date();
  const formattedToday = format(today, "EEEE, d MMMM yyyy", { locale: id });
  const isFilledToday = recentLkh?.some(lkh => {
    const lkhDate = new Date(lkh.tanggal).toDateString();
    return lkhDate === today.toDateString();
  });

  const handleOpenNew = () => {
    setSelectedLkh(null);
    setIsModalOpen(true);
  };

  const handleEdit = (lkh: any) => {
    setSelectedLkh(lkh);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Header Ringkas Minimalis */}
      <div className="border-b border-slate-200/80 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-800/50 px-3 py-0.5 text-[11px] font-extrabold text-teal-700 dark:text-teal-300 mb-2">
            <ClipboardList className="h-3.5 w-3.5" />
            <span>Manajemen Laporan Kinerja (E-LK)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Dashboard E-LK Harian
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-xs sm:text-sm max-w-xl font-medium leading-relaxed">
            Kelola dan rekam seluruh laporan aktivitas kerja harian ASN Anda dengan akuntabel.
          </p>
        </div>

        {/* Status Pengisian Hari Ini */}
        <div className="inline-flex items-center gap-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-3.5 py-2 shadow-xs shrink-0 self-start sm:self-auto transition-all hover:scale-105">
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isFilledToday ? "bg-emerald-400" : "bg-amber-400"} opacity-75`} />
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isFilledToday ? "bg-emerald-500" : "bg-amber-500"}`} />
          </span>
          <div className="text-xs">
            <span className="font-extrabold text-slate-500 dark:text-slate-400 mr-1.5">Status Hari Ini:</span>
            <span className={`font-black ${isFilledToday ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
              {isFilledToday ? "Sudah Diisi ✨" : "Belum Diisi"}
            </span>
          </div>
        </div>
      </div>

      {/* Banner Pengingat Hari Ini dengan Trigger Floating Modal */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-teal-900 via-emerald-900 to-slate-900 text-white p-5 sm:p-7 shadow-xl border border-teal-700/30 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-2.5 py-1 text-[11px] font-bold text-teal-200 backdrop-blur-md">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>{formattedToday}</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
            {isFilledToday ? "Laporan Harian Anda Telah Tercatat!" : "Jangan Lupa Mengisi LKH Hari Ini!"}
          </h2>
          <p className="text-xs sm:text-sm text-teal-100/80 font-medium leading-relaxed max-w-lg">
            {isFilledToday 
              ? "Terima kasih telah merekam aktivitas kinerja harian Anda secara rutin dan akuntabel."
              : "Catat setiap poin kegiatan kerja yang Anda selesaikan hari ini untuk rekap kinerja bulanan."}
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          <Button 
            onClick={handleOpenNew}
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm px-5 py-3 h-11 sm:h-12 rounded-xl sm:rounded-2xl shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-95 gap-2 border-0 cursor-pointer"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            <span>Isi LKH Sekarang</span>
          </Button>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-16 -bottom-16 h-48 w-48 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />
      </div>

      {/* Section List Aktivitas Terbaru */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileCheck2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span>Aktivitas LKH Terbaru</span>
          </h2>
          {recentLkh && recentLkh.length > 0 && (
            <Link
              href="/pegawai/e-lk/riwayat"
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 transition-colors"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
          {recentLkh && recentLkh.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {recentLkh.map((lkh) => (
                <div key={lkh.id} className="p-4 sm:p-5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5 sm:gap-4 min-w-0 flex-1">
                    <div className="h-11 w-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform shadow-xs">
                      <ClipboardList className="h-5.5 w-5.5" />
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                        {lkh.kegiatanTugasJabatan}
                      </h3>
                      {lkh.hasil && (
                        <div className="flex items-center gap-2 flex-wrap pt-0.5">
                          <div className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-semibold bg-slate-100/80 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg">
                            <span className="text-slate-400 font-normal">Hasil:</span>
                            <span>{lkh.hasil}</span>
                          </div>
                          {lkh.waktuPelaksanaan && (
                            <div className="inline-flex items-center gap-1 text-[11px] text-teal-700 dark:text-teal-300 font-bold bg-teal-50 dark:bg-teal-950/60 border border-teal-200/50 dark:border-teal-800/40 px-2.5 py-1 rounded-lg">
                              <span>⏰ {lkh.waktuPelaksanaan}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right side: Clear Date Badge & Modern Edit Button */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/60">
                    <div className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/50 px-3 py-1.5 rounded-xl text-emerald-800 dark:text-emerald-200 font-extrabold text-xs">
                      <CalendarDays className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{format(new Date(lkh.tanggal), "EEEE, d MMMM yyyy", { locale: id })}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleEdit(lkh)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 text-slate-700 dark:text-slate-300 font-extrabold text-xs transition-all active:scale-95 cursor-pointer shadow-xs"
                      title="Ubah LKH"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      <span>Ubah</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 sm:p-16 text-center flex flex-col items-center justify-center gap-3">
              <div className="h-16 w-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <ClipboardList className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-slate-900 dark:text-slate-100 font-extrabold text-base">Belum Ada Laporan LKH</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-sm font-medium leading-relaxed">
                Anda belum pernah mengisi Laporan Kinerja Harian. Mulai catat aktivitas kerja harian Anda sekarang.
              </p>
              <Button 
                onClick={handleOpenNew}
                className="mt-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md gap-2 border-0 cursor-pointer"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Buat LKH Pertama</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Modal Pengisian LKH */}
      <LkhModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={selectedLkh}
      />
    </div>
  );
}
