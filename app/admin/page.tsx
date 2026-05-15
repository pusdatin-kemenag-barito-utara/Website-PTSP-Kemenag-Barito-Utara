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
import prisma from "@/lib/prisma";
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
import { format } from "date-fns";
import { id } from "date-fns/locale";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminHomePage() {
  const profile = await requireAdmin();

  // Fetch permissions for this user
  let allowedMenus: string[] = [];
  if (profile.role === "super_admin" || isSuperAdmin(profile.email)) {
    allowedMenus = ALL_ADMIN_MENUS;
  } else {
    allowedMenus = (profile.permissions as string[]) || DEFAULT_ADMIN_PERMISSIONS;
  }

  const [serviceCount, userCount, requests] = await Promise.all([
    prisma.services.count(),
    prisma.profiles.count(),
    prisma.service_requests.findMany({
      select: { status: true },
    }),
  ]);

  const stats = {
    submitted: requests.filter((item: { status: string }) => item.status === "submitted").length,
    underReview: requests.filter((item: { status: string }) => item.status === "under_review").length,
    revision: requests.filter((item: { status: string }) => item.status === "revision_required").length,
    finished: requests.filter((item: { status: string }) =>
      ["approved", "completed"].includes(item.status),
    ).length,
  };

  const totalRequests = requests.length;
  const needAction = stats.submitted + stats.underReview;

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
  ].filter((menu: { id: string }) => allowedMenus.includes(menu.id));

  // --- Analytics Data Processing ---
  
  // 1. Top Services
  const topServicesRaw = await prisma.service_requests.groupBy({
    by: ['service_id'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 5
  });

  const serviceIds = topServicesRaw.map((s: { service_id: bigint | null }) => s.service_id).filter((id: bigint | null) => id !== null) as bigint[];
  const servicesInfo = await prisma.services.findMany({
    where: { id: { in: serviceIds } },
    select: { id: true, name: true }
  });

  const serviceAnalytics = topServicesRaw.map((s: any) => {
    const info = servicesInfo.find((si: { id: bigint, name: string }) => si.id === s.service_id);
    return {
      name: info?.name || 'Lainnya',
      count: s._count.id
    };
  });

  // 2. Trend Data (7 Days)
  const last7DaysRequests = await prisma.service_requests.findMany({
    where: {
      created_at: {
        gte: new Date(new Date().setDate(new Date().getDate() - 7))
      }
    },
    select: { created_at: true }
  });

  const trendDataMap = new Map();
  last7DaysRequests.forEach((r: { created_at: Date }) => {
    const date = r.created_at.toISOString().split('T')[0];
    trendDataMap.set(date, (trendDataMap.get(date) || 0) + 1);
  });

  const trendAnalytics = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
    trendAnalytics.push({
      date: label,
      count: trendDataMap.get(dateStr) || 0
    });
  }

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
