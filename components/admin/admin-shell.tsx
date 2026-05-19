"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Files,
  FormInput,
  ListChecks,
  FolderKanban,
  Users,
  FileOutput,
  Mail,
  Inbox,
  Send,
  History,
  Database,
  BookOpen,
  Calendar,
} from "lucide-react";
import { isSuperAdmin as checkSuperAdmin } from "@/lib/constants";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Profile = Record<string, any>;

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  group?: string;
  id: string;
}

const ADMIN_NAV: NavItem[] = [
  {
    label: "Ringkasan",
    href: "/admin",
    icon: LayoutDashboard,
    group: "Utama",
    id: "ringkasan",
  },
  {
    label: "Pengajuan",
    href: "/admin/pengajuan",
    icon: FolderKanban,
    group: "Utama",
    id: "pengajuan",
  },
  {
    label: "Dokumen Hasil",
    href: "/admin/dokumen-hasil",
    icon: FileOutput,
    group: "Utama",
    id: "dokumen_hasil",
  },
  {
    label: "Layanan",
    href: "/admin/layanan",
    icon: FileText,
    group: "Master Data",
    id: "layanan",
  },
  {
    label: "Buku Tamu",
    href: "/admin/buku-tamu",
    icon: BookOpen,
    group: "Layanan Publik",
    id: "buku_tamu",
  },
  {
    label: "Janji Temu",
    href: "/admin/janji-temu",
    icon: Calendar,
    group: "Layanan Publik",
    id: "janji_temu",
  },
  {
    label: "Saran & Pengaduan",
    href: "/admin/saran-pengaduan",
    icon: Mail,
    group: "Layanan Publik",
    id: "saran_pengaduan",
  },
  {
    label: "Surat Masuk",
    href: "/admin/persuratan/surat-masuk",
    icon: Inbox,
    group: "Tata Naskah",
    id: "surat_masuk",
  },
  {
    label: "Surat Keluar",
    href: "/admin/persuratan/surat-keluar",
    icon: Send,
    group: "Tata Naskah",
    id: "surat_keluar",
  },
  {
    label: "Pengguna",
    href: "/admin/pengguna",
    icon: Users,
    group: "Sistem",
    id: "pengguna",
  },
  {
    label: "Log Audit",
    href: "/admin/log-audit",
    icon: History,
    group: "Sistem",
    id: "log_audit",
  },
  {
    label: "Pemeliharaan Storage",
    href: "/admin/pemeliharaan-storage",
    icon: Database,
    group: "Sistem",
    id: "pemeliharaan_storage",
  },
];

export function AdminShell({
  profile,
  allowedMenus = [],
  children,
}: {
  profile: Profile;
  allowedMenus?: string[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Filter navigation items based on role permissions
  const isSuperAdmin = checkSuperAdmin(profile?.email);
  const authorizedNav = isSuperAdmin
    ? ADMIN_NAV
    : ADMIN_NAV.filter((item: NavItem) => allowedMenus.includes(item.id));

  const groups = Array.from(
    new Set(authorizedNav.map((item: NavItem) => item.group || "")),
  );

  const initials = (profile?.fullName || profile?.email || "A")
    .split(" ")
    .map((w: any[]) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex w-full overflow-hidden bg-slate-50 fixed inset-0">
      {/* ── Desktop Sidebar ─────────────────────────────────────── */}
      <aside className="hidden lg:flex w-[280px] shrink-0 flex-col bg-white border-r border-slate-200 shadow-[2px_0_8px_-4px_rgba(0,0,0,0.05)] z-20">
        <AdminSidebar
          groups={groups}
          authorizedNav={authorizedNav}
          pathname={pathname}
          profile={profile}
          isSuperAdmin={isSuperAdmin}
          initials={initials}
        />
      </aside>

      {/* ── Mobile sidebar overlay ──────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <aside className="relative z-10 flex w-[280px] flex-col bg-white border-r border-slate-200 shadow-2xl">
            <AdminSidebar
              groups={groups}
              authorizedNav={authorizedNav}
              pathname={pathname}
              profile={profile}
              isSuperAdmin={isSuperAdmin}
              initials={initials}
              onNavClick={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* ── Main content area ───────────────────────────────────── */}
      <div className="flex flex-1 min-w-0 flex-col overflow-hidden bg-slate-50">
        <AdminTopbar
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          isSuperAdmin={isSuperAdmin}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
