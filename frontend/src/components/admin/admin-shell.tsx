import type { ReactNode } from "react";
import { usePathname } from "@/lib/next-compat/navigation";
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
  CalendarCheck,
  Construction,
  UserCog,
  BadgeCheck,
  Building2,
  Settings,
  Shield,
  ChevronDown,
  Menu,
  Bell,
  LogOut,
  X,
  Settings2,
} from "lucide-react";
import { isSuperAdmin as checkSuperAdmin } from "@/lib/constants";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { Toaster, toast } from "sonner";
import "sonner/dist/styles.css";

if (typeof window !== "undefined") {
  (window as any).toast = toast;
}

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
    label: "Pengajuan Masyarakat",
    href: "/admin/pengajuan?type=public",
    icon: FolderKanban,
    group: "Layanan Masyarakat",
    id: "pengajuan_masyarakat",
  },
  {
    label: "Dokumen Hasil",
    href: "/admin/dokumen-hasil?type=public",
    icon: FileOutput,
    group: "Layanan Masyarakat",
    id: "dokumen_hasil_masyarakat",
  },
  {
    label: "Pengaturan Layanan",
    href: "/admin/layanan",
    icon: FileText,
    group: "Layanan Masyarakat",
    id: "layanan",
  },
  {
    label: "Pengajuan Pegawai",
    href: "/admin/pengajuan?type=asn",
    icon: FolderKanban,
    group: "Layanan Pegawai",
    id: "pengajuan_pegawai",
  },
  {
    label: "Dokumen Hasil",
    href: "/admin/dokumen-hasil?type=asn",
    icon: FileOutput,
    group: "Layanan Pegawai",
    id: "dokumen_hasil_pegawai",
  },
  {
    label: "Pengaturan Layanan",
    href: "/admin/layanan-asn",
    icon: Users,
    group: "Layanan Pegawai",
    id: "layanan_asn",
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
    label: "Manajemen Cuti",
    href: "/admin/kepegawaian/pegawai",
    icon: CalendarCheck,
    group: "Layanan Pegawai",
    id: "manajemen_pegawai",
  },
  {
    label: "E-Laporan Kinerja",
    href: "/admin/kepegawaian/laporan",
    icon: FileText,
    group: "Kepegawaian",
    id: "e_laporan_kinerja",
  },
  {
    label: "Unit Kerja & Role",
    href: "/admin/kepegawaian/unit-kerja",
    icon: Building2,
    group: "Kepegawaian",
    id: "unit_kerja",
  },

  // --- MANAJEMEN PENGGUNA ---
  {
    label: "Petugas Admin",
    href: "/admin/pengguna?tab=petugas",
    icon: UserCog,
    group: "Manajemen Pengguna",
    id: "pengguna_petugas",
  },
  {
    label: "Data Pegawai",
    href: "/admin/pengguna?tab=pegawai",
    icon: BadgeCheck,
    group: "Manajemen Pengguna",
    id: "pengguna_pegawai",
  },
  {
    label: "Pemohon Masyarakat",
    href: "/admin/pengguna?tab=pemohon",
    icon: Users,
    group: "Manajemen Pengguna",
    id: "pengguna_pemohon",
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
  currentPath,
  currentSearch,
  activeMenu,
  activeType,
  children,
}: {
  profile: Profile;
  allowedMenus?: string[];
  currentPath?: string;
  currentSearch?: string;
  activeMenu?: string;
  activeType?: "public" | "asn";
  children: ReactNode;
}) {
  const routerPathname = usePathname();
  const pathname =
    (typeof window !== "undefined"
      ? (routerPathname || window.location.pathname)
      : currentPath) || "";
  const [mobileOpen, setMobileOpen] = useState(false);

  // Filter navigation items based on role permissions
  const isSuperAdmin = checkSuperAdmin(profile?.email);
  const authorizedNav = isSuperAdmin
    ? ADMIN_NAV
    : ADMIN_NAV.filter(
        (item: NavItem) =>
          allowedMenus.includes(item.id) ||
          (item.group === "Manajemen Pengguna" &&
            (allowedMenus.includes("pengguna") ||
              allowedMenus.includes("manajemen_pegawai"))) ||
          (item.id === "unit_kerja" &&
            (allowedMenus.includes("unit_kerja") ||
              allowedMenus.includes("pengguna") ||
              allowedMenus.includes("manajemen_pegawai"))),
      );

  const groups = Array.from(
    new Set(authorizedNav.map((item: NavItem) => item.group || "")),
  );

  const initials = ((profile?.fullName || profile?.email || "A") + " ")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] || "")
    .join("")
    .toUpperCase();

  return (
    <div className="flex w-full overflow-hidden bg-slate-50 fixed inset-0">
      {/* ── Desktop Sidebar ─────────────────────────────────────── */}
      <aside className="hidden lg:flex w-[245px] shrink-0 flex-col bg-[#0f1117] border-r border-white/5 shadow-[2px_0_20px_rgba(0,0,0,0.3)] z-20">
        <AdminSidebar
          groups={groups}
          authorizedNav={authorizedNav}
          pathname={pathname}
          currentSearch={currentSearch}
          activeMenu={activeMenu}
          activeType={activeType}
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
          <aside className="relative z-10 flex w-[250px] flex-col bg-[#0f1117] border-r border-white/5 shadow-2xl">
            <AdminSidebar
              groups={groups}
              authorizedNav={authorizedNav}
              pathname={pathname}
              currentSearch={currentSearch}
              activeMenu={activeMenu}
              activeType={activeType}
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
          profile={profile}
          initials={initials}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-scroll [scrollbar-gutter:stable] p-3 sm:p-4 md:p-5 min-w-0 max-w-full overflow-x-hidden">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>

      {/* ── Global Toaster for Admin Panel ──────────────────────── */}
      <Toaster
        position="top-right"
        richColors
        duration={2500}
        toastOptions={{
          style: {
            borderRadius: "16px",
            boxShadow:
              "0 10px 30px -4px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04)",
            border: "1px solid rgba(226, 232, 240, 0.8)",
            padding: "12px 18px",
            fontSize: "13px",
            fontWeight: "500",
          },
          className: "text-[13px] font-sans antialiased",
        }}
      />
    </div>
  );
}
