import {
  LayoutDashboard,
  FileText,
  Files,
  FormInput,
  FolderKanban,
  Users,
  FileOutput,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/admin/page-header";
import {
  isSuperAdmin,
  ALL_ADMIN_MENUS,
  DEFAULT_ADMIN_PERMISSIONS,
} from "@/lib/constants";

import { AdminAlertBanner } from "@/components/admin/dashboard/admin-alert-banner";
import { AdminDashboardMetrics } from "@/components/admin/dashboard/admin-dashboard-metrics";
import { AdminStatusProgress } from "@/components/admin/dashboard/admin-status-progress";
import { AdminQuickLinks } from "@/components/admin/dashboard/admin-quick-links";
import { DashboardRealtimeSync } from "@/components/admin/dashboard/dashboard-realtime-sync";
import { AdminServiceAnalytics } from "@/components/admin/dashboard/admin-service-analytics";
import { AdminTrendAnalytics } from "@/components/admin/dashboard/admin-trend-analytics";

// Lib Functions
import {
  getAdminDashboardStats,
  getAdminDashboardAnalytics,
} from "./_lib/dashboard-data";

import { getAdminSpecificRole } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminHomePage() {
  const profile = await requireAdmin();
  const isSuper = isSuperAdmin(profile.email);
  const specificRole = getAdminSpecificRole(profile.email, profile.role ?? "");
  const isGeneralAdmin = specificRole === "admin_ptsp";

  const roleOwnerFilter = isSuper || isGeneralAdmin ? undefined : specificRole;

  // Fetch permissions for this user
  let allowedMenus: string[] = [];
  if (profile.role === "super_admin" || isSuper) {
    allowedMenus = ALL_ADMIN_MENUS;
  } else {
    allowedMenus =
      (profile.permissions as string[]) || DEFAULT_ADMIN_PERMISSIONS;
  }

  const {
    serviceCount,
    userCount,
    stats,
    totalRequests,
    needAction,
  } = await getAdminDashboardStats(roleOwnerFilter);

  const {
    serviceAnalytics,
    trendAnalytics,
  } = await getAdminDashboardAnalytics(roleOwnerFilter);

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
    <div className="space-y-6">
      <DashboardRealtimeSync />
      <PageHeader
        title="Ringkasan Dashboard"
        description="Pantau kondisi layanan, aktivitas pengguna, dan progres pengajuan terkini."
        icon={LayoutDashboard}
      />

      <AdminAlertBanner needAction={needAction} />

      <AdminDashboardMetrics
        serviceCount={serviceCount}
        userCount={userCount}
        needAction={needAction}
        totalRequests={totalRequests}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <AdminStatusProgress totalRequests={totalRequests} stats={stats} />
        <AdminQuickLinks quickMenus={quickMenus} />
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AdminServiceAnalytics data={serviceAnalytics} />
        <AdminTrendAnalytics data={trendAnalytics} />
      </div>
    </div>
  );
}
