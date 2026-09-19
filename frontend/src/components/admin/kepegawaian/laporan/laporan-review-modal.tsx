import React, { useState, useEffect } from "react";
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  CalendarDays, 
  Clock, 
  MessageSquare, 
  UserCheck, 
  Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LaporanKinerjaItem } from "./types";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { toast } from "sonner";
import { updateLaporanStatusAction } from "@/lib/actions/admin/kepegawaian";

interface LaporanReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  laporan: LaporanKinerjaItem | null;
  onSuccess: (updatedLaporan: LaporanKinerjaItem) => void;
}

export const LaporanReviewModal: React.FC<LaporanReviewModalProps> = ({
  isOpen,
  onClose,
  laporan,
  onSuccess,
}) => {
  const [status, setStatus] = useState<"approved" | "revision" | "pending">("approved");
  const [komentar, setKomentar] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (laporan) {
      setStatus(
        laporan.status === "approved" || laporan.status === "revision"
          ? (laporan.status as any)
          : "approved"
      );
      setKomentar(laporan.komentarPimpinan || "");
    }
  }, [laporan]);

  if (!isOpen || !laporan) return null;

  let formattedDate = laporan.tanggal;
  try {
    formattedDate = format(new Date(laporan.tanggal), "EEEE, d MMMM yyyy", { locale: localeId });
  } catch (e) {}

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await updateLaporanStatusAction(laporan.id, status, komentar);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(
          status === "approved"
            ? "Laporan kinerja berhasil disetujui!"
            : "Catatan evaluasi revisi berhasil dikirim!"
        );
        onSuccess({
          ...laporan,
          status,
          komentarPimpinan: komentar || null,
          updatedAt: new Date().toISOString(),
        });
        onClose();
      }
    } catch (err: any) {
      toast.error("Terjadi kesalahan saat menyimpan evaluasi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Tinjau Laporan Kinerja (E-LK)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Evaluasi dan berikan persetujuan atau catatan perbaikan pada laporan pegawai.
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

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Detail Pegawai Info Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {laporan.pegawaiNama || "Pegawai ASN"}
                </h4>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  NIP: {laporan.pegawaiNip || "-"} • {laporan.pegawaiJabatan || "-"}
                </p>
              </div>

              <span className="self-start sm:self-auto inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-extrabold bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {laporan.pegawaiUnitKerja || "-"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
              <div className="inline-flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-300">
                <CalendarDays className="h-3.5 w-3.5 text-emerald-600" />
                <span>{formattedDate}</span>
              </div>

              {laporan.waktuPelaksanaan && (
                <div className="inline-flex items-center gap-1.5 font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md">
                  <Clock className="h-3 w-3" />
                  <span>{laporan.waktuPelaksanaan}</span>
                </div>
              )}

              <div className="inline-flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 bg-slate-200/60 dark:bg-slate-700/60 px-2 py-0.5 rounded-md">
                <span>Output:</span>
                <span className="text-emerald-700 dark:text-emerald-400">{laporan.hasil}</span>
              </div>
            </div>
          </div>

          {/* Uraian Kegiatan */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Uraian Kegiatan Tugas Jabatan
            </label>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium whitespace-pre-line leading-relaxed">
              {laporan.kegiatanTugasJabatan}
            </div>
          </div>

          {/* Bukti Dukung Link jika ada */}
          {laporan.buktiDukungUrl && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Bukti Dukung / Lampiran
              </label>
              <div>
                <a
                  href={laporan.buktiDukungUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/70 dark:border-blue-800/50 text-blue-700 dark:text-blue-300 text-xs font-bold hover:bg-blue-100 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Buka Berkas Bukti Dukung</span>
                </a>
              </div>
            </div>
          )}

          {/* Status Decision Selector */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Keputusan Tinjauan Pimpinan:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStatus("approved")}
                className={`p-3 rounded-2xl border flex items-center justify-center gap-2 text-xs font-extrabold transition-all cursor-pointer ${
                  status === "approved"
                    ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-xs scale-[1.02]"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                }`}
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Setujui (Approved)</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus("revision")}
                className={`p-3 rounded-2xl border flex items-center justify-center gap-2 text-xs font-extrabold transition-all cursor-pointer ${
                  status === "revision"
                    ? "bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-700 dark:text-rose-300 shadow-xs scale-[1.02]"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                }`}
              >
                <AlertCircle className="h-4 w-4 text-rose-600" />
                <span>Perlu Revisi / Catatan</span>
              </button>
            </div>
          </div>

          {/* Textarea Catatan / Komentar Pimpinan */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
              <span>Catatan / Komentar Pimpinan {status === "revision" && <span className="text-rose-500">*</span>}</span>
            </label>
            <textarea
              rows={3}
              value={komentar}
              onChange={(e) => setKomentar(e.target.value)}
              placeholder={
                status === "revision"
                  ? "Tuliskan poin koreksi atau bagian kegiatan yang perlu diperbaiki pegawai..."
                  : "Catatan evaluasi atau apresiasi pimpinan (opsional)..."
              }
              required={status === "revision"}
              className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs font-semibold text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-10 px-4 rounded-xl border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={`h-10 px-5 rounded-xl font-extrabold text-xs text-white shadow-xs cursor-pointer gap-2 ${
                status === "approved"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <span>{isSubmitting ? "Menyimpan..." : "Simpan Evaluasi"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
