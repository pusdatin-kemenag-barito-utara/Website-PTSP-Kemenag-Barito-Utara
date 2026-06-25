import { getCurrentUser } from "@/lib/auth";
import { getLaporanKinerjaAction } from "@/lib/actions/pegawai/e-lk";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, PlusCircle, CheckCircle2, Clock, CalendarDays } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default async function ElkhHarianPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Get recent 5 LKH
  const { data: recentLkh } = await getLaporanKinerjaAction(user.id, 5);

  const today = new Date();
  const formattedToday = format(today, "EEEE, d MMMM yyyy", { locale: id });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Dashboard E-LK Harian</h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">Kelola laporan kinerja harian Anda dengan mudah.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-none shadow-lg shadow-emerald-500/20 rounded-2xl sm:rounded-3xl overflow-hidden relative">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 bg-white opacity-10 rounded-full blur-2xl"></div>
          <div className="p-5 sm:p-6 pb-2 relative z-10">
            <h3 className="text-emerald-50 text-xs sm:text-sm font-medium flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Hari Ini
            </h3>
          </div>
          <div className="p-5 sm:p-6 pt-0 relative z-10">
            <div className="text-xl sm:text-2xl font-bold">{formattedToday}</div>
            <p className="text-emerald-100 text-[11px] sm:text-xs mt-1">Jangan lupa isi LKH Anda hari ini!</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-6 sm:mt-8 gap-3 sm:gap-4">
        <h2 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
          <ClipboardList className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
          Aktivitas Terbaru
        </h2>
        <Link href="/pegawai/e-lk/isi" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 gap-2 h-11 sm:h-10 text-[15px] sm:text-sm rounded-xl">
            <PlusCircle className="h-4 w-4 sm:h-4 sm:w-4" />
            Isi LKH Sekarang
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        {recentLkh && recentLkh.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {recentLkh.map((lkh) => (
              <div key={lkh.id} className="p-4 sm:p-5 hover:bg-slate-50 transition-colors flex items-start gap-3 sm:gap-4">
                <div className="bg-emerald-100 text-emerald-700 p-2 sm:p-2.5 rounded-xl flex-shrink-0 mt-0.5">
                  <ClipboardList className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-sm sm:text-base font-bold text-slate-800 truncate pr-2">
                      {lkh.kegiatanTugasJabatan}
                    </h3>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-500 mb-1.5">{format(new Date(lkh.tanggal), "EEEE, d MMMM yyyy", { locale: id })}</p>
                  <p className="text-[13px] sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">{lkh.hasil}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="bg-slate-100 p-4 rounded-full mb-4">
              <ClipboardList className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-slate-800 font-bold mb-1">Belum ada LKH</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
              Anda belum mengisi Laporan Kinerja Harian sama sekali. Silakan mulai isi laporan kinerja Anda secara rutin.
            </p>
            <Link href="/pegawai/e-lk/isi">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm gap-2">
                <PlusCircle className="h-4 w-4" />
                Buat LKH Pertama
              </Button>
            </Link>
          </div>
        )}
        {recentLkh && recentLkh.length > 0 && (
          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
            <Link href="/pegawai/e-lk/riwayat" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline">
              Lihat Semua Riwayat &rarr;
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
