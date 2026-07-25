import { getMyRequests } from "@/lib/actions/pegawai/requests";
import { RiwayatTable } from "./_components/riwayat-table";
import { ScrollText } from "lucide-react";

export const metadata = {
  title: "Riwayat Pengajuan | PTSP Kemenag Barito Utara",
  description: "Lihat seluruh riwayat pengajuan layanan ASN Anda.",
};

export default async function RiwayatLayananPage() {
  const requests = await getMyRequests();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Header Ringkas */}
      <div className="border-b border-slate-200/80 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/50 px-3 py-0.5 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300 mb-2">
            <ScrollText className="h-3.5 w-3.5" />
            <span>Arsip & Tracking Layanan</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Riwayat Pengajuan Layanan
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-xs sm:text-sm max-w-xl font-medium leading-relaxed">
            Pantau status dan rekap seluruh pengajuan permohonan layanan ASN Anda.
          </p>
        </div>

        {/* Lencana Statistik Pengajuan */}
        <div className="inline-flex items-center gap-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-3.5 py-2 shadow-xs shrink-0 self-start sm:self-auto transition-all hover:scale-105">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
          </span>
          <div className="text-xs">
            <span className="font-black text-slate-900 dark:text-slate-100 text-sm mr-1">{requests.length}</span>
            <span className="font-extrabold text-slate-500 dark:text-slate-400">Total Pengajuan</span>
          </div>
        </div>
      </div>

      {/* Table & Filtering */}
      <RiwayatTable requests={requests} />
    </div>
  );
}
