import { Metadata } from "next";
import { getCurrentProfile } from "@/lib/auth";
import { getPegawaiDashboardData } from "./_lib/dashboard-data";
import { PegawaiDashboardMetrics } from "@/components/pegawai/dashboard/pegawai-dashboard-metrics";
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
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-4 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
          <div className="space-y-1 sm:space-y-2">
            <div className="inline-flex items-center rounded-full bg-white/20 px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-medium backdrop-blur-md">
              Portal Mandiri Pegawai
            </div>
            <h1 className="text-xl sm:text-3xl font-bold tracking-tight">
              Halo, {profile?.fullName || "Pegawai"}!
            </h1>
            <p className="max-w-xl text-emerald-100 text-[11px] sm:text-base leading-relaxed">
              Selamat datang di portal kepegawaian. Kelola layanan ASN dan laporan E-LK Harian Anda dengan mudah di sini.
            </p>
          </div>
        </div>
        <div className="absolute -right-20 -top-20 h-48 sm:h-64 w-48 sm:w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 sm:-bottom-32 left-6 sm:left-10 h-48 sm:h-64 w-48 sm:w-64 rounded-full bg-teal-500/20 blur-3xl" />
      </div>

      {/* Approval Alert for Pejabat */}
      {showApprovalAlert && (
        <PegawaiApprovalAlert
          isPejabat={data.isPejabat}
          pendingAtasanCount={data.pendingAtasanCount}
          pendingKepalaCount={data.pendingKepalaCount}
        />
      )}

      {/* Summary Stats */}
      <PegawaiDashboardMetrics
        sisaCuti={data.sisaCuti}
        totalPengajuanCuti={data.totalPengajuanCuti}
        pengajuanPending={data.pengajuanPending}
        pengajuanDisetujuiBulanIni={data.pengajuanDisetujuiBulanIni}
      />

      {/* Recent Activity + Quick Access */}
      <div className={`grid grid-cols-1 gap-4 sm:gap-6 ${showRecentActivity ? "lg:grid-cols-3" : ""}`}>
        <div className={`${showRecentActivity ? "lg:col-span-2" : ""}`}>
          <PegawaiQuickAccessCards />
        </div>

        {/* Recent Activity */}
        {showRecentActivity && (
          <div className="lg:col-span-1">
            <PegawaiRecentActivity items={data.recentCuti} />
          </div>
        )}
      </div>
    </div>
  );
}
