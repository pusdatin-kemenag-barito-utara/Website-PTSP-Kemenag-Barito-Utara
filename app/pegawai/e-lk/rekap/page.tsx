import { getCurrentUser } from "@/lib/auth";
import { getRekapBulananAction } from "@/lib/actions/pegawai/e-lk";
import { Card } from "@/components/ui/card";
import { CalendarDays, FileText, Download } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { RekapFilter } from "@/components/pegawai/e-lk/rekap-filter";
import { CetakDrafButton } from "@/components/pegawai/e-lk/cetak-draf-button";

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
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const totalKegiatanBulanIni =
    rekap?.reduce((acc, curr) => acc + (curr.totalKegiatan || 0), 0) || 0;
  const totalHariKerjaIsi = rekap?.length || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Rekapitulasi Bulanan
          </h1>
          <p className="text-slate-500 mt-1">
            Lihat ringkasan jumlah kegiatan yang Anda laporkan per bulan.
          </p>
        </div>

        {/* Simple filter UI using regular links/buttons for this Server Component */}
        <div className="flex items-center gap-2">
          <RekapFilter
            initialMonth={selectedMonth}
            initialYear={selectedYear}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-md rounded-2xl sm:rounded-3xl overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 bg-white/20 rounded-xl w-fit">
                <CalendarDays className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div>
                <p className="text-blue-100 text-xs sm:text-sm font-medium mb-0.5 sm:mb-1">
                  Hari Terisi
                </p>
                <div className="text-xl sm:text-3xl font-bold">
                  {totalHariKerjaIsi} Hari
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-none shadow-md rounded-2xl sm:rounded-3xl overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 bg-white/20 rounded-xl w-fit">
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div>
                <p className="text-emerald-100 text-xs sm:text-sm font-medium mb-0.5 sm:mb-1">
                  Total Laporan
                </p>
                <div className="text-xl sm:text-3xl font-bold">
                  {totalKegiatanBulanIni} Laporan
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border border-slate-200 shadow-sm overflow-hidden bg-white rounded-3xl">
        <div className="p-0">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold text-slate-700">
              Rincian Per Hari - {monthNames[selectedMonth - 1]} {selectedYear}
            </h3>
            <CetakDrafButton
              rekap={rekap || []}
              monthName={monthNames[selectedMonth - 1]}
              year={selectedYear}
              userName={
                user.user_metadata?.full_name || user.email || "Pegawai"
              }
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] sm:text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 sm:px-6 sm:py-4 font-bold whitespace-nowrap">
                    Tanggal
                  </th>
                  <th className="px-4 py-3 sm:px-6 sm:py-4 font-bold text-center whitespace-nowrap">
                    Jumlah Kegiatan
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {rekap && rekap.length > 0 ? (
                  rekap.map((item, i) => (
                    <tr
                      key={i}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-4 py-3 sm:px-6 sm:py-4 font-medium text-slate-700 whitespace-nowrap">
                        {format(
                          new Date(item.tanggal as string),
                          "EEEE, d MMMM yyyy",
                          { locale: id },
                        )}
                      </td>
                      <td className="px-4 py-3 sm:px-6 sm:py-4 text-center">
                        <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 bg-emerald-100 text-emerald-700 font-bold rounded-full text-[10px] sm:text-xs">
                          {item.totalKegiatan}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      Tidak ada data laporan kinerja di bulan ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
