"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Menu,
  X,
  Home,
  LayoutGrid,
  Search,
  FilePlus,
  PhoneCall,
  LayoutDashboard,
  LogIn,
  UserCircle2,
  Shield,
  Activity,
  BookOpen,
  Calendar,
  MessageSquare,
  Briefcase,
  Lightbulb,
  HeartHandshake,
  Box,
  FileText,
  Calculator,
  Database,
} from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { GlobalSearchModal } from "@/components/global-search-modal";
import { isAdminRole } from "@/lib/constants";
import { LoginDropdown } from "@/components/header/login-dropdown";
import { MobileNav } from "@/components/header/mobile-nav";
import { HeaderControls } from "@/components/header/header-controls";
type HeaderProfile = {
  role?: string | null;
};

const navItems = [
  { label: "Beranda", href: "/", icon: Home },
  {
    label: "Layanan",
    href: "#",
    icon: LayoutGrid,
    children: [
      {
        label: "Katalog Layanan Masyarakat",
        href: "/layanan",
        icon: LayoutGrid,
      },
      {
        label: "Katalog Layanan Pegawai",
        href: "/layanan-pegawai",
        icon: LayoutGrid,
      },
      { label: "Cek Cuti", href: "/cek-cuti", icon: FilePlus },
    ],
  },
  { label: "Track Pengajuan", href: "/track", icon: Search },
  {
    label: "Tamu",
    href: "#",
    icon: BookOpen,
    children: [
      { label: "Buku Tamu", href: "/buku-tamu", icon: BookOpen },
      { label: "Janji Temu", href: "/janji-temu", icon: Calendar },
    ],
  },
  {
    label: "Inovasi",
    href: "#",
    icon: Lightbulb,
    children: [
      {
        label: "Pusat Layanan Inklusi",
        href: "https://inklusi.kemenag-baritoutara.com",
        icon: HeartHandshake,
        external: true,
      },
      {
        label: "SI BETANG",
        href: "https://arsip.kemenag-baritoutara.com",
        icon: Box,
        external: true,
      },
      {
        label: "SI MANDAU",
        href: "https://surat.kemenag-baritoutara.com",
        icon: LayoutDashboard,
        external: true,
      },
      {
        label: "E-SOP Digital",
        href: "https://sop.kemenag-baritoutara.com",
        icon: FileText,
        external: true,
      },
      {
        label: "Kalkulator Zakat & Wakaf",
        href: "https://baritoutara.kemenag.go.id/layanan/kalkulator",
        icon: Calculator,
        external: true,
      },
      {
        label: "PUSDATIN",
        href: "https://pusdatin.kemenag-baritoutara.com",
        icon: Database,
        external: true,
      },
    ],
  },
  {
    label: "E-Pengaduan",
    href: "https://pengaduan.kemenag-baritoutara.com",
    icon: MessageSquare,
    external: true,
  },
  { label: "Kontak", href: "/kontak", icon: PhoneCall },
];

import { m, AnimatePresence } from "framer-motion";

export function SiteHeaderClient({
  profile,
}: {
  profile: HeaderProfile | null;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setLoginOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  // Close login dropdown when clicking outside
  useEffect(() => {
    if (!loginOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-login-dropdown]")) setLoginOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [loginOpen]);

  // Close nav dropdown when clicking outside
  useEffect(() => {
    if (!openDropdown) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-nav-dropdown]")) setOpenDropdown(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openDropdown]);

  const dashboardHref = isAdminRole(profile?.role)
    ? "/admin"
    : profile?.role === "pegawai"
      ? "/pegawai"
      : "/masyarakat";

  let dashboardLabel = "Dashboard";
  if (profile) {
    if (isAdminRole(profile.role)) dashboardLabel = "DASHBOARD PETUGAS";
    else if (profile.role === "pegawai") dashboardLabel = "DASHBOARD PEGAWAI";
    else if (profile.role === "user") dashboardLabel = "DASHBOARD PEMOHON";
    else if (profile.role)
      dashboardLabel = `DASHBOARD ${profile.role.toUpperCase()}`;
  }

  const isAdmin = isAdminRole(profile?.role);
  const isPegawai = profile?.role === "pegawai";

  let badgeLabel = "Pemohon";
  if (isAdmin) badgeLabel = "Petugas";
  else if (isPegawai) badgeLabel = "Pegawai";

  return (
    <>
      <header className="sticky top-0 left-0 right-0 z-[100] w-full transition-colors duration-300 shadow-sm bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl">
        {/* Modern Gradient Line Divider */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 dark:via-emerald-400/50 to-transparent" />
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-12 xl:px-16">
          {/* Top Header Bar */}
          <div className="flex items-center justify-between py-2.5 lg:py-4">
            {/* Logo */}
            <Link href="/" className="flex min-w-0 items-center gap-3 group">
              <span className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 p-2 ring-1 ring-emerald-100 transition-all duration-300 group-hover:shadow-md">
                <Image
                  src="/atak-portal.png"
                  alt="Logo Kemenag"
                  width={40}
                  height={40}
                  className="h-auto w-8 sm:w-10 object-contain"
                  style={{ width: "40px", height: "auto" }}
                  priority
                />
              </span>
              <div className="min-w-0 flex flex-col justify-center">
                <p className="truncate text-[11px] sm:text-[13px] lg:text-sm font-black tracking-wide text-emerald-800 flex items-center gap-1">
                  PTSP Si{" "}
                  <Image
                    src="/atak.png"
                    alt="ATAK"
                    width={48}
                    height={20}
                    className="h-[1em] w-auto object-contain inline-block"
                    style={{ height: "1em", width: "auto" }}
                  />
                </p>
                <div className="mt-0.5 text-[10px] sm:text-[11px] lg:text-[12px] font-bold text-emerald-800 dark:text-emerald-300 leading-tight">
                  <div className="block sm:hidden truncate">
                    <span className="text-amber-500 font-black">S</span>istem{" "}
                    <span className="text-amber-500 font-black">I</span>nformasi
                  </div>
                  <div className="block sm:hidden truncate">
                    <span className="text-amber-500 font-black">A</span>dministrasi{" "}
                    <span className="text-amber-500 font-black">T</span>erpadu Layanan{" "}
                    <span className="text-amber-500 font-black">K</span>eagamaan
                  </div>
                  <div className="hidden sm:block truncate">
                    <span className="text-amber-500 font-black">S</span>istem{" "}
                    <span className="text-amber-500 font-black">I</span>nformasi{" "}
                    <span className="text-amber-500 font-black">A</span>dministrasi{" "}
                    <span className="text-amber-500 font-black">T</span>erpadu Layanan{" "}
                    <span className="text-amber-500 font-black">K</span>eagamaan
                  </div>
                </div>
              </div>
            </Link>

            {/* Top Right Controls & CTAs */}
            <div className="flex items-center gap-3 sm:gap-6">
              {/* Logo HAPAKAT (Versi Website Kemenag Barito Utara - Tanpa Wrapper Card) */}
              <div className="hidden xl:flex items-center gap-2.5">
                <Image
                  src="/icons/hapakat.png"
                  alt="HAPAKAT"
                  width={96}
                  height={26}
                  style={{ width: "96px", height: "auto" }}
                  className="h-6 w-auto object-contain drop-shadow-sm -translate-y-0.5"
                  unoptimized
                />
                <div className="hidden 2xl:block text-[10.5px] font-bold leading-tight text-emerald-800 dark:text-emerald-300">
                  <span className="text-amber-500 font-black">H</span>armonis,{" "}
                  <span className="text-amber-500 font-black">A</span>manah,{" "}
                  <span className="text-amber-500 font-black">P</span>rofesional,{" "}
                  <span className="text-amber-500 font-black">A</span>kuntabel,{" "}
                  <span className="text-amber-500 font-black">K</span>reatif,{" "}
                  <span className="text-amber-500 font-black">A</span>dil dan{" "}
                  <span className="text-amber-500 font-black">T</span>ransparan
                </div>
              </div>

              {/* Theme (Light/Dark) Switcher - Tampil di Desktop & Mobile sebelah Hamburger */}
              <div className="flex items-center">
                <HeaderControls />
              </div>

              {/* CTAs */}
              <div className="hidden lg:flex items-center gap-3">
                {profile ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-full px-4 py-2 bg-slate-100 border border-slate-200 text-slate-700">
                      {isAdmin ? (
                        <Shield className="h-4 w-4 text-emerald-600" />
                      ) : isPegawai ? (
                        <Briefcase className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <UserCircle2 className="h-4 w-4 text-slate-500" />
                      )}
                      <span className="text-xs font-bold">{badgeLabel}</span>
                    </div>
                    <Link
                      href={dashboardHref}
                      className="group relative flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-emerald-700 to-emerald-600 px-6 py-2.5 text-[11px] font-black uppercase tracking-[0.1em] text-white transition-all hover:shadow-[0_8px_20px_-6px_rgba(16,185,129,0.5)] active:scale-95"
                    >
                      <span className="relative z-10">{dashboardLabel}</span>
                      <div className="absolute inset-0 bg-white/20 transition-transform duration-500 translate-y-full group-hover:translate-y-0" />
                    </Link>
                    <SignOutButton />
                  </div>
                ) : (
                  <LoginDropdown
                    loginOpen={loginOpen}
                    setLoginOpen={setLoginOpen}
                    needsDarkStyle={true}
                  />
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="relative z-[101] flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 shadow-sm transition active:scale-95 lg:hidden"
              >
                {mobileOpen ? (
                  <X className="h-5 w-5 text-emerald-700 dark:text-emerald-500" />
                ) : (
                  <Menu className="h-5 w-5 text-emerald-700 dark:text-emerald-500" />
                )}
              </button>
            </div>
          </div>

          {/* Desktop Navigation Row */}
          <nav className="hidden py-2.5 lg:block">
            <div className="flex items-center justify-center relative">
              <ul className="flex flex-nowrap items-center justify-center gap-4 xl:gap-8">
                {navItems.map((item) => {
                  const hasChildren = item.children && item.children.length > 0;
                  const isOpen = openDropdown === item.label;
                  const active =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href));

                  return (
                    <li
                      key={item.label}
                      className="relative"
                      onMouseEnter={() =>
                        hasChildren && setOpenDropdown(item.label)
                      }
                      onMouseLeave={() => hasChildren && setOpenDropdown(null)}
                    >
                      {hasChildren ? (
                        <div
                          className={`group inline-flex cursor-pointer flex-shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-[12.5px] font-black uppercase tracking-tight transition-all duration-300 ${
                            active || isOpen
                              ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                              : "text-slate-900 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-500/5 dark:hover:bg-emerald-500/10"
                          }`}
                        >
                          {item.label}
                          <ChevronDown
                            className={`h-3 w-3 transition-transform duration-500 ${isOpen ? "rotate-180 text-emerald-500" : "text-slate-400 dark:text-slate-500 group-hover:text-emerald-500"}`}
                          />

                          {/* Active Indicator Underline */}
                          {active && (
                            <div className="absolute bottom-0 left-4 right-8 h-0.5 rounded-full bg-emerald-500/50" />
                          )}
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          target={item.external ? "_blank" : undefined}
                          rel={item.external ? "noopener noreferrer" : undefined}
                          className={`relative inline-flex flex-shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-[12.5px] font-black uppercase tracking-tight transition-all duration-300 ${
                            active
                              ? "text-emerald-700 dark:text-emerald-400"
                              : "text-slate-900 dark:text-slate-200 hover:bg-emerald-500/5 dark:hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-400"
                          }`}
                        >
                          {item.label}
                          {active && (
                            <div className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-emerald-500" />
                          )}
                        </Link>
                      )}

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {hasChildren && isOpen && (
                          <m.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{
                              type: "spring",
                              stiffness: 220,
                              damping: 18,
                            }}
                            className="absolute left-0 top-full z-50 pt-2 min-w-[240px]"
                          >
                            <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
                              <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl" />
                              <ul className="relative z-10 space-y-0.5">
                                {item.children?.map((child) => {
                                  const ChildIcon = child.icon;
                                  return (
                                    <li key={child.href}>
                                      <Link
                                        href={child.href}
                                        target={(child as any).external ? "_blank" : undefined}
                                        rel={(child as any).external ? "noopener noreferrer" : undefined}
                                        onClick={() => setOpenDropdown(null)}
                                        className="group/item flex items-center justify-between rounded-xl px-4 py-3 text-[11.5px] font-black uppercase tracking-widest text-slate-900 dark:text-slate-200 transition-all hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white"
                                      >
                                        <div className="flex items-center gap-2.5">
                                          <ChildIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400 group-hover/item:text-white transition-colors" />
                                          <span>{child.label}</span>
                                        </div>
                                        <ChevronDown className="h-3 w-3 -rotate-90 opacity-0 transition-all -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0" />
                                      </Link>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          </m.div>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ul>

              {/* Global Search Icon UI placeholder */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="absolute right-0 flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors mr-2"
              >
                <Search className="h-4.5 w-4.5" />
              </button>
            </div>
          </nav>
        </div>
      </header>

      <MobileNav
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        needsDarkStyle={false}
        pathname={pathname}
        navItems={navItems}
        profile={profile}
        dashboardHref={dashboardHref}
        isAdmin={isAdmin}
      />
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
