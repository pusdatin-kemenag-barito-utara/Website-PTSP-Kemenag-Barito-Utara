import {
  LayoutDashboard,
  FileText,
  Files,
  FormInput,
  FolderKanban,
  Users,
  FileOutput,
} from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";

import { AdminAlertBanner } from "@/components/admin/dashboard/admin-alert-banner";
import { AdminDashboardMetrics } from "@/components/admin/dashboard/admin-dashboard-metrics";
import { AdminStatusProgress } from "@/components/admin/dashboard/admin-status-progress";
import { AdminQuickLinks } from "@/components/admin/dashboard/admin-quick-links";
import { DashboardRealtimeSync } from "@/components/admin/dashboard/dashboard-realtime-sync";
import { AdminAnalyticsWrapper } from "@/components/admin/dashboard/admin-analytics-wrapper";

export function AdminDashboardView({
  masyarakat,
  pegawai,
  serviceAnalytics,
  trendAnalytics,
  allowedMenus,
}: {
  masyarakat: any;
  pegawai: any;
  serviceAnalytics: any[];
  trendAnalytics: any[];
  allowedMenus: string[];
}) {
  const quickMenus = [
    {
      id: "layanan",
      label: "Kelola Layanan",
      href: "/admin/layanan",
      icon: FileText,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      id: "item_layanan",
      label: "Item Layanan",
      href: "/admin/item-layanan",
      icon: Files,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      id: "form_layanan",
      label: "Form & Persyaratan",
      href: "/admin/form-layanan",
      icon: FormInput,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      id: "pengajuan",
      label: "Review Pengajuan",
      href: "/admin/pengajuan",
      icon: FolderKanban,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      id: "pengguna",
      label: "Manajemen Pengguna",
      href: "/admin/pengguna",
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      id: "dokumen_hasil",
      label: "Dokumen Hasil",
      href: "/admin/dokumen-hasil",
      icon: FileOutput,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
  ].filter((menu: { id: string }) => {
    if (menu.id === "item_layanan" || menu.id === "form_layanan") {
      return allowedMenus.includes("layanan");
    }
    return allowedMenus.includes(menu.id);
  });

  return (
    <div className="space-y-10 pb-10">
      <DashboardRealtimeSync />

      {/* Header Utama */}
      <div>
        <PageHeader
          title="Ringkasan Dashboard"
          description="Pantau kondisi layanan, aktivitas pengguna, dan progres pengajuan terkini."
          icon={LayoutDashboard}
        />

        {/* Alerts Area */}
        <div className="mt-6 flex flex-col gap-4">
          <AdminAlertBanner
            needAction={masyarakat.needAction}
            title="Perhatian Tindakan Masyarakat"
            href="/admin/pengajuan?type=public"
          />
          <AdminAlertBanner
            needAction={pegawai.needAction}
            title="Perhatian Tindakan Pegawai (ASN)"
            href="/admin/pengajuan?type=asn"
          />
        </div>
      </div>

      {/* Bagian Layanan Masyarakat */}
      <section className="relative">
        <div className="mb-6 flex items-center gap-3">
          <div className="h-10 w-2.5 rounded-full bg-emerald-500" />
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Sistem Layanan Masyarakat
          </h2>
        </div>

        <div className="space-y-6">
          <AdminDashboardMetrics
            serviceCount={masyarakat.serviceCount}
            userCount={masyarakat.userCount}
            needAction={masyarakat.needAction}
            totalRequests={masyarakat.totalRequests}
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <AdminStatusProgress
              totalRequests={masyarakat.totalRequests}
              stats={masyarakat.stats}
              title="Progres Pengajuan Masyarakat"
              href="/admin/pengajuan?type=public"
            />
            <AdminQuickLinks quickMenus={quickMenus} />
          </div>
        </div>
      </section>

      {/* Pembatas Ombak (Wave) */}
      <div className="w-full py-4 relative">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" className="w-full h-auto text-indigo-50/50 fill-current">
          <path d="M0,32L60,42.7C120,53,240,75,360,74.7C480,75,600,53,720,42.7C840,32,960,32,1080,42.7C1200,53,1320,75,1380,85.3L1440,96L1440,100L1380,100C1320,100,1200,100,1080,100C960,100,840,100,720,100C600,100,480,100,360,100C240,100,120,100,60,100L0,100Z"></path>
        </svg>
      </div>

      {/* Bagian Layanan Kepegawaian */}
      <section className="relative rounded-3xl bg-indigo-50/30 p-6 sm:p-8 border border-indigo-100/50">
        <div className="mb-6 flex items-center gap-3">
          <div className="h-10 w-2.5 rounded-full bg-indigo-500" />
          <h2 className="text-2xl font-black text-indigo-900 tracking-tight">
            Sistem Layanan Kepegawaian
          </h2>
        </div>

        <div className="space-y-6">
          <AdminDashboardMetrics
            serviceCount={pegawai.serviceCount}
            userCount={pegawai.userCount}
            needAction={pegawai.needAction}
            totalRequests={pegawai.totalRequests}
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <AdminStatusProgress
              totalRequests={pegawai.totalRequests}
              stats={pegawai.stats}
              title="Progres Pengajuan Pegawai"
              href="/admin/pengajuan?type=asn"
            />
            {/* Analytics khusus jika dibutuhkan, sementara pakai yang umum */}
            <div className="lg:col-span-1">
              <AdminAnalyticsWrapper
                serviceAnalytics={serviceAnalytics}
                trendAnalytics={trendAnalytics}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminDashboardView;