import { getCurrentUser } from "@/lib/auth";
import { getRekapBulananAction } from "@/lib/actions/pegawai/e-lk";
import { CalendarDays, ClipboardCheck, Sparkles, Clock, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { RekapFilter } from "@/components/pegawai/e-lk/rekap-filter";
import { RekapTableClient } from "./_components/rekap-table-client";

export default async function RekapLkhPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const { month, year } = await searchParams;

  const currentDate = new Date();
  const selectedMonth = month
    ? parseInt(month as string)
    : currentDate.getMonth() + 1;
  const selectedYear = year
    ? parseInt(year as string)
    : currentDate.getFullYear();

  const { data: rekap } = await getRekapBulananAction(
    user.id,
    selectedMonth,
    selectedYear,
  );

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];

  // Calculate unique days with records
  const uniqueDaysCount = rekap 
    ? new Set(rekap.map(item => item.tanggal)).size 
    : 0;

  const totalKegiatanBulanIni = rekap?.length || 0;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Header & Filter Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Rekapitulasi Kinerja ASN</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Rekap E-LK Bulanan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Lihat dan cetak ringkasan rekapitulasi laporan aktivitas kerja harian Anda per bulan.
          </p>
        </div>

        <div className="shrink-0">
          <RekapFilter
            initialMonth={selectedMonth}
            initialYear={selectedYear}
          />
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-teal-600 to-emerald-700 text-white shadow-xl shadow-teal-700/15 border border-teal-500/30">
          <div className="flex items-center justify-between relative z-10">
            <div className="space-y-1">
              <p className="text-teal-100 text-xs font-bold uppercase tracking-wider">
                Hari Terisi
              </p>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                {uniqueDaysCount} <span className="text-lg font-extrabold text-teal-200">Hari</span>
              </h2>
              <p className="text-xs text-teal-100/80 font-medium pt-1">
                Tercatat aktif di bulan {monthNames[selectedMonth - 1]} {selectedYear}
              </p>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white shrink-0 border border-white/20">
              <CalendarDays className="h-7 w-7" />
            </div>
          </div>
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-700/15 border border-emerald-500/30">
          <div className="flex items-center justify-between relative z-10">
            <div className="space-y-1">
              <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider">
                Total Aktivitas Laporan
              </p>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                {totalKegiatanBulanIni} <span className="text-lg font-extrabold text-emerald-200">Aktivitas</span>
              </h2>
              <p className="text-xs text-emerald-100/80 font-medium pt-1">
                Poin laporan kinerja yang diselesaikan
              </p>
            </div>
            <div className="h-14 w-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white shrink-0 border border-white/20">
              <ClipboardCheck className="h-7 w-7" />
            </div>
          </div>
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        </div>
      </div>

      {/* Main Activity Table Card Client Component */}
      <RekapTableClient
        rekap={rekap || []}
        monthName={monthNames[selectedMonth - 1]}
        year={selectedYear}
        userName={
          user.user_metadata?.full_name || user.email || "Pegawai"
        }
      />
    </div>
  );
}
