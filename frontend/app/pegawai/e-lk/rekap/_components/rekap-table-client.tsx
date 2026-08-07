"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarDays, Clock, CheckCircle2, Edit2, Trash2, Loader2 } from "lucide-react";
import { LkhModal } from "@/components/pegawai/e-lk/lkh-modal";
import { deleteLaporanKinerjaAction } from "@/lib/actions/pegawai/e-lk";
import { toast } from "sonner";
import { CetakDrafButton } from "@/components/pegawai/e-lk/cetak-draf-button";

interface RekapTableClientProps {
  rekap: any[];
  monthName: string;
  year: number;
  userName: string;
}

export function RekapTableClient({ rekap, monthName, year, userName }: RekapTableClientProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLkh, setSelectedLkh] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleEdit = (lkh: any) => {
    setSelectedLkh(lkh);
    setIsModalOpen(true);
  };

  const handleDelete = async (lkhId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data LKH ini?")) return;

    setDeletingId(lkhId);
    try {
      const res = await deleteLaporanKinerjaAction(lkhId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("LKH berhasil dihapus!");
        router.refresh();
      }
    } catch (err: any) {
      toast.error("Gagal menghapus LKH.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-lg overflow-hidden transition-all">
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
              Rincian Aktivitas LKH – {monthName} {year}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Daftar rinci seluruh poin pekerjaan harian pegawai yang telah diinput.
            </p>
          </div>
          <CetakDrafButton
            rekap={rekap || []}
            monthName={monthName}
            year={year}
            userName={userName}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] uppercase tracking-wider font-extrabold text-slate-500 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5 font-black whitespace-nowrap w-12 text-center">No</th>
                <th className="px-5 py-3.5 font-black whitespace-nowrap min-w-[170px]">Tanggal</th>
                <th className="px-5 py-3.5 font-black whitespace-nowrap min-w-[130px]">Waktu</th>
                <th className="px-5 py-3.5 font-black min-w-[260px]">Kegiatan Tugas Jabatan</th>
                <th className="px-5 py-3.5 font-black whitespace-nowrap min-w-[130px]">Kuantitas / Hasil</th>
                <th className="px-5 py-3.5 font-black whitespace-nowrap min-w-[90px] text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs sm:text-sm font-semibold">
              {rekap && rekap.length > 0 ? (
                rekap.map((item, i) => (
                  <tr
                    key={item.id || i}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="px-5 py-4 text-center font-mono text-slate-400 font-bold">
                      {i + 1}
                    </td>
                    <td className="px-5 py-4 text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 font-extrabold text-xs bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl">
                        <CalendarDays className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>
                          {format(
                            new Date(item.tanggal as string),
                            "EEEE, d MMMM yyyy",
                            { locale: id },
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {item.waktuPelaksanaan ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200/50 dark:border-teal-800/40 px-2 py-0.5 rounded-lg">
                          <Clock className="h-3 w-3" />
                          <span>{item.waktuPelaksanaan}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                      {item.kegiatanTugasJabatan}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/50 px-2.5 py-1 rounded-xl">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>{item.hasil}</span>
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          title="Ubah LKH"
                          className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center justify-center transition-all active:scale-90 border border-slate-200/60 dark:border-slate-700 cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          title="Hapus LKH"
                          className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center transition-all active:scale-90 border border-slate-200/60 dark:border-slate-700 cursor-pointer disabled:opacity-50"
                        >
                          {deletingId === item.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-16 text-center text-slate-500 dark:text-slate-400"
                  >
                    <div className="max-w-xs mx-auto space-y-2">
                      <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                        <CalendarDays className="h-6 w-6" />
                      </div>
                      <p className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">
                        Tidak Ada Data LKH
                      </p>
                      <p className="text-xs text-slate-400">
                        Belum ada data laporan kinerja harian yang terrekam di bulan {monthName} {year}.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Modal for Edit LKH */}
      <LkhModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedLkh(null);
        }}
        initialData={selectedLkh}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </>
  );
}
