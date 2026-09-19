import {
  FileText,
  Files,
  FormInput,
  FolderKanban,
  Users,
  FileOutput,
} from "lucide-react";

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
    <div className="space-y-4 pb-6">
      <DashboardRealtimeSync />
      {/* Alerts Area */}
      {(masyarakat.needAction > 0 || pegawai.needAction > 0) && (
        <div className="flex flex-col gap-2">
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
      )}

      {/* Bagian Layanan Masyarakat */}
      <section className="relative">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-4 w-1.5 rounded-full bg-emerald-500" />
          <h2 className="text-base font-bold text-slate-800 tracking-tight">
            Sistem Layanan Masyarakat
          </h2>
        </div>

        <div className="space-y-3.5">
          <AdminDashboardMetrics
            serviceCount={masyarakat.serviceCount}
            userCount={masyarakat.userCount}
            needAction={masyarakat.needAction}
            totalRequests={masyarakat.totalRequests}
          />

          <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-3">
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

      {/* Pembatas Minimalis */}
      <div className="border-t border-slate-200/70" />

      {/* Bagian Layanan Kepegawaian */}
      <section className="relative rounded-2xl bg-indigo-50/30 p-3.5 sm:p-4 border border-indigo-100/50">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-4 w-1.5 rounded-full bg-indigo-500" />
          <h2 className="text-base font-bold text-indigo-900 tracking-tight">
            Sistem Layanan Kepegawaian
          </h2>
        </div>

        <div className="space-y-3.5">
          <AdminDashboardMetrics
            serviceCount={pegawai.serviceCount}
            userCount={pegawai.userCount}
            needAction={pegawai.needAction}
            totalRequests={pegawai.totalRequests}
          />

          <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-3">
            <AdminStatusProgress
              totalRequests={pegawai.totalRequests}
              stats={pegawai.stats}
              title="Progres Pengajuan Pegawai"
              href="/admin/pengajuan?type=asn"
            />
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