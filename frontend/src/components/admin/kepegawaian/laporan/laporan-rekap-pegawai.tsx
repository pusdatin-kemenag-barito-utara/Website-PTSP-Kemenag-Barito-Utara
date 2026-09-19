import React, { useMemo } from "react";
import { 
  Users, 
  CalendarDays, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight,
  TrendingUp
} from "lucide-react";
import type { LaporanKinerjaItem, PegawaiRekapSummary } from "./types";

interface LaporanRekapPegawaiProps {
  items: LaporanKinerjaItem[];
  onSelectPegawai: (nipOrNama: string) => void;
  selectedMonth: number;
  selectedYear: number;
}

export const LaporanRekapPegawai: React.FC<LaporanRekapPegawaiProps> = ({
  items,
  onSelectPegawai,
  selectedMonth,
  selectedYear,
}) => {
  // Aggregate statistics per pegawai
  const pegawaiSummaries = useMemo(() => {
    const map = new Map<string, PegawaiRekapSummary>();

    items.forEach((item) => {
      const key = item.pegawaiNip || item.userId || item.pegawaiNama;
      if (!map.has(key)) {
        map.set(key, {
          userId: item.userId,
          nama: item.pegawaiNama || "Tanpa Nama",
          nip: item.pegawaiNip || "-",
          jabatan: item.pegawaiJabatan || "-",
          unitKerja: item.pegawaiUnitKerja || "-",
          avatarUrl: item.pegawaiAvatar,
          totalLkh: 0,
          approvedCount: 0,
          pendingCount: 0,
          revisionCount: 0,
          distinctDays: 0,
        });
      }

      const summary = map.get(key)!;
      summary.totalLkh += 1;
      if (item.status === "approved") summary.approvedCount += 1;
      else if (item.status === "revision") summary.revisionCount += 1;
      else summary.pendingCount += 1;
    });

    // Calculate distinct days per pegawai
    map.forEach((summary, key) => {
      const days = new Set(
        items
          .filter((item) => (item.pegawaiNip || item.userId || item.pegawaiNama) === key)
          .map((item) => item.tanggal)
      );
      summary.distinctDays = days.size;
    });

    return Array.from(map.values()).sort((a, b) => b.totalLkh - a.totalLkh);
  }, [items]);

  const targetWorkingDays = 21; // Standar hari kerja bulanan

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-600" />
            <span>Rekap Keaktifan Pengisian LKH per Pegawai</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Menampilkan ringkasan total aktivitas kerja dan jumlah hari aktif setiap pegawai ASN.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/50 text-xs font-bold text-emerald-700 dark:text-emerald-300">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>Target Ideal: ~{targetWorkingDays} Hari Kerja/Bulan</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
            <tr>
              <th className="px-5 py-3.5 w-12 text-center">No</th>
              <th className="px-5 py-3.5 min-w-[240px]">Pegawai</th>
              <th className="px-5 py-3.5 min-w-[160px]">Unit Kerja</th>
              <th className="px-5 py-3.5 min-w-[120px] text-center">Hari Kerja Terisi</th>
              <th className="px-5 py-3.5 min-w-[120px] text-center">Total LKH</th>
              <th className="px-5 py-3.5 min-w-[170px] text-center">Status Verifikasi</th>
              <th className="px-5 py-3.5 min-w-[120px] text-right">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
            {pegawaiSummaries.length > 0 ? (
              pegawaiSummaries.map((pegawai, idx) => {
                const percentage = Math.min(
                  100,
                  Math.round((pegawai.distinctDays / targetWorkingDays) * 100)
                );

                return (
                  <tr
                    key={pegawai.nip || idx}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="px-5 py-3.5 text-center font-mono font-bold text-slate-400">
                      {idx + 1}
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {pegawai.avatarUrl ? (
                          <img
                            src={pegawai.avatarUrl}
                            alt={pegawai.nama}
                            className="h-9 w-9 rounded-2xl object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="h-9 w-9 rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center justify-center font-black text-xs shrink-0 border border-emerald-200/50">
                            {pegawai.nama.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-black text-slate-900 dark:text-white truncate">
                            {pegawai.nama}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            NIP: {pegawai.nip} • {pegawai.jabatan}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {pegawai.unitKerja}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-center">
                      <div className="space-y-1">
                        <span className="font-black text-xs text-slate-900 dark:text-white">
                          {pegawai.distinctDays} / {targetWorkingDays} Hari
                        </span>
                        <div className="w-24 mx-auto h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              percentage >= 80
                                ? "bg-emerald-500"
                                : percentage >= 50
                                ? "bg-amber-500"
                                : "bg-rose-500"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-black bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/50">
                        {pegawai.totalLkh} Aktivitas
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-[10px] font-extrabold">
                        {pegawai.approvedCount > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                            {pegawai.approvedCount} Disetujui
                          </span>
                        )}
                        {pegawai.pendingCount > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                            {pegawai.pendingCount} Pending
                          </span>
                        )}
                        {pegawai.revisionCount > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300">
                            {pegawai.revisionCount} Revisi
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onSelectPegawai(pegawai.nama)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-2xs"
                      >
                        <span>Lihat LKH</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                  Tidak ada data pegawai yang mengisi LKH di periode ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
