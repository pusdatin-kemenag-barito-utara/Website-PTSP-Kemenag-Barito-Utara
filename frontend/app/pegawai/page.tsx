import { Metadata } from "next";
import { getCurrentProfile } from "@/lib/auth";
import { getPegawaiDashboardData } from "./_lib/dashboard-data";
import { PegawaiElkSummaryCard } from "@/components/pegawai/dashboard/pegawai-elk-summary";
import { PegawaiApprovalAlert } from "@/components/pegawai/dashboard/pegawai-approval-alert";
import { PegawaiRecentActivity } from "@/components/pegawai/dashboard/pegawai-recent-activity";
import { PegawaiQuickAccessCards } from "@/components/pegawai/dashboard/pegawai-quick-access";

export const metadata: Metadata = {
  title: "Dashboard Pegawai | PTSP Kemenag Barito Utara",
  description: "Dashboard panel untuk pegawai PTSP Kemenag Barito Utara",
};

export default async function PegawaiDashboardPage() {
  const profile = await getCurrentProfile();
  const data = await getPegawaiDashboardData();
  const showRecentActivity = data.recentCuti.length > 0;
  const showApprovalAlert = data.isPejabat && (data.pendingAtasanCount > 0 || data.pendingKepalaCount > 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Modern Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950 p-5 sm:p-8 lg:p-10 text-white shadow-xl border border-emerald-700/30 transition-all duration-300 animate-in fade-in slide-in-from-bottom-3">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 lg:gap-8">
          {/* Left Content */}
          <div className="flex-1 space-y-2.5 sm:space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 dark:bg-emerald-950/80 border border-white/20 dark:border-emerald-800/60 px-3 py-1 backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-200 dark:text-emerald-300">
                Portal Mandiri Pegawai
              </span>
            </div>

            <h1 className="text-lg sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-snug">
              <span className="block sm:inline">Selamat Datang, </span>
              <span className="text-emerald-300 block sm:inline">
                {profile?.fullName || "Pegawai"} 👋
              </span>
            </h1>

            <p className="max-w-xl text-[11px] sm:text-sm font-medium text-emerald-100/90 dark:text-slate-300 leading-relaxed">
              Selamat datang di portal kepegawaian. Kelola layanan ASN, permohonan cuti, dan laporan E-LK Harian Anda secara mandiri di satu tempat.
            </p>
          </div>

          {/* Right Action / Info Card */}
          <div className="hidden lg:flex flex-col gap-3 bg-white/10 dark:bg-slate-800/60 backdrop-blur-md border border-white/15 dark:border-slate-700/50 p-5 rounded-2xl shrink-0 min-w-[240px]">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-200">
              Tahun Anggaran {new Date().getFullYear()}
            </div>
            <div className="text-2xl font-black text-white">
              {data.sisaCuti !== null ? `${data.sisaCuti} Hari` : "—"}
            </div>
            <div className="text-xs text-emerald-100/80 font-medium">
              Sisa Kuota Cuti Tahunan Anda
            </div>
          </div>
        </div>

        {/* Decorative Background Glows */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 left-10 h-64 w-64 rounded-full bg-teal-500/20 blur-3xl pointer-events-none" />
      </div>

      {/* Approval Alert for Pejabat */}
      {showApprovalAlert && (
        <PegawaiApprovalAlert
          isPejabat={data.isPejabat}
          pendingAtasanCount={data.pendingAtasanCount}
          pendingKepalaCount={data.pendingKepalaCount}
        />
      )}

      {/* Rekap E-LK & Ringkasan Status Cuti ASN */}
      <PegawaiElkSummaryCard
        sisaCuti={data.sisaCuti}
        pengajuanPending={data.pengajuanPending}
        pengajuanDisetujuiBulanIni={data.pengajuanDisetujuiBulanIni}
        totalPengajuan={data.totalPengajuanCuti}
      />

      {/* Recent Activity */}
      {showRecentActivity && (
        <div className="w-full">
          <PegawaiRecentActivity items={data.recentCuti} />
        </div>
      )}
    </div>
  );
}
