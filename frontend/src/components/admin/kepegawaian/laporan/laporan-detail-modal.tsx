import React from "react";
import { 
  X, 
  FileText, 
  CalendarDays, 
  Clock, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  User, 
  MessageSquare 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LaporanKinerjaItem } from "./types";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface LaporanDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  laporan: LaporanKinerjaItem | null;
  onOpenReview?: (laporan: LaporanKinerjaItem) => void;
}

export const LaporanDetailModal: React.FC<LaporanDetailModalProps> = ({
  isOpen,
  onClose,
  laporan,
  onOpenReview,
}) => {
  if (!isOpen || !laporan) return null;

  let formattedDate = laporan.tanggal;
  try {
    formattedDate = format(new Date(laporan.tanggal), "EEEE, d MMMM yyyy", { locale: localeId });
  } catch (e) {}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Rincian Laporan Kinerja Harian
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Detail lengkap data aktivitas kerja harian yang diisi pegawai.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Pegawai Info */}
          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60">
            {laporan.pegawaiAvatar ? (
              <img
                src={laporan.pegawaiAvatar}
                alt={laporan.pegawaiNama}
                className="h-12 w-12 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0"
              />
            ) : (
              <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                {laporan.pegawaiNama ? laporan.pegawaiNama.slice(0, 2).toUpperCase() : "ASN"}
              </div>
            )}

            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {laporan.pegawaiNama || "Pegawai ASN"}
                </h4>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-black inline-flex items-center gap-1 ${
                    laporan.status === "approved"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300"
                      : laporan.status === "revision"
                      ? "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300"
                  }`}
                >
                  {laporan.status === "approved" ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : laporan.status === "revision" ? (
                    <AlertCircle className="h-3.5 w-3.5" />
                  ) : (
                    <Clock className="h-3.5 w-3.5" />
                  )}
                  <span>
                    {laporan.status === "approved"
                      ? "Disetujui"
                      : laporan.status === "revision"
                      ? "Perlu Revisi"
                      : "Menunggu Review"}
                  </span>
                </span>
              </div>

              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                NIP: {laporan.pegawaiNip || "-"} • {laporan.pegawaiJabatan || "-"}
              </p>
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                <span>{laporan.pegawaiUnitKerja || "-"}</span>
              </p>
            </div>
          </div>

          {/* Date, Time & Output Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Tanggal Pelaksanaan</span>
              <p className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-emerald-600" />
                <span>{formattedDate}</span>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Durasi / Jam Kerja</span>
              <p className="font-extrabold text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>{laporan.waktuPelaksanaan || "-"}</span>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Kuantitas / Capaian</span>
              <p className="font-extrabold text-emerald-700 dark:text-emerald-300">
                {laporan.hasil}
              </p>
            </div>
          </div>

          {/* Uraian Kegiatan */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Uraian Lengkap Kegiatan Tugas Jabatan
            </label>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium whitespace-pre-line leading-relaxed">
              {laporan.kegiatanTugasJabatan}
            </div>
          </div>

          {/* Bukti Dukung */}
          {laporan.buktiDukungUrl && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Bukti Dukung / Tautan Berkas
              </label>
              <div>
                <a
                  href={laporan.buktiDukungUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/70 dark:border-blue-800/50 text-blue-700 dark:text-blue-300 text-xs font-extrabold hover:bg-blue-100 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Buka Berkas Bukti Dukung ({laporan.buktiDukungUrl})</span>
                </a>
              </div>
            </div>
          )}

          {/* Catatan / Komentar Pimpinan */}
          {laporan.komentarPimpinan && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/50 space-y-1.5">
              <label className="text-xs font-black text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Catatan / Komentar Evaluasi Pimpinan:</span>
              </label>
              <p className="text-xs sm:text-sm font-semibold text-amber-900 dark:text-amber-200 whitespace-pre-line leading-relaxed">
                {laporan.komentarPimpinan}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-9 px-4 rounded-xl border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs cursor-pointer"
          >
            Tutup
          </Button>

          {onOpenReview && (
            <Button
              type="button"
              onClick={() => {
                onClose();
                onOpenReview(laporan);
              }}
              className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 cursor-pointer shadow-xs"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Tinjau Laporan Ini</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
