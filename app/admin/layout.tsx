import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  isSuperAdmin,
  ALL_ADMIN_MENUS,
  DEFAULT_ADMIN_PERMISSIONS,
} from "@/lib/constants";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await requireAdmin();

  // Fetch permissions for this user
  let allowedMenus: string[] = [];
  if (profile.role === "super_admin" || isSuperAdmin(profile.email)) {
    allowedMenus = ALL_ADMIN_MENUS;
  } else {
    // If permissions array is null/undefined in DB, use default
    allowedMenus = (profile.permissions as string[]) || DEFAULT_ADMIN_PERMISSIONS;
  }

  return (
    <AdminShell profile={profile} allowedMenus={allowedMenus}>
      {children}
    </AdminShell>
  );
}
