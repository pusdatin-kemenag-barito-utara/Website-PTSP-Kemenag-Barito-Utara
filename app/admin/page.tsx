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
import { createAdminClient } from "@/lib/supabase/admin";
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

export default async function AdminHomePage() {
  const profile = await requireAdmin();
  const admin = createAdminClient();

  // Fetch permissions for this user
  let allowedMenus: string[] = [];
  if (profile.role === "super_admin" || isSuperAdmin(profile.email)) {
    allowedMenus = ALL_ADMIN_MENUS;
  } else {
    allowedMenus = profile.permissions || DEFAULT_ADMIN_PERMISSIONS;
  }

  const [{ count: serviceCount }, { count: userCount }, { data: requests }] =
    await Promise.all([
      admin.from("services").select("*", { count: "exact", head: true }),
      admin.from("profiles").select("*", { count: "exact", head: true }),
      admin.from("service_requests").select("status"),
    ]);

  const stats = {
    submitted:
      requests?.filter((item) => item.status === "submitted").length ?? 0,
    underReview:
      requests?.filter((item) => item.status === "under_review").length ?? 0,
    revision:
      requests?.filter((item) => item.status === "revision_required").length ??
      0,
    finished:
      requests?.filter((item) =>
        ["approved", "completed"].includes(item.status),
      ).length ?? 0,
  };

  const totalRequests = requests?.length ?? 0;
  const needAction = stats.submitted + stats.underReview;

  const quickMenus = [
    {
      id: "layanan",
      label: "Kelola Layanan",
      href: "/admin/layanan",
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      id: "item_layanan",
      label: "Item Layanan",
      href: "/admin/item-layanan",
      icon: Files,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      id: "form_layanan",
      label: "Form & Persyaratan",
      href: "/admin/form-layanan",
      icon: FormInput,
      color: "text-violet-600",
      bg: "bg-violet-50",
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
  ].filter((menu) => allowedMenus.includes(menu.id));

  return (
    <div className="space-y-6">
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

      {/* Two Column Layout for Status and Quick Links */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <AdminStatusProgress totalRequests={totalRequests} stats={stats} />
        <AdminQuickLinks quickMenus={quickMenus} />
      </div>
    </div>
  );
}
