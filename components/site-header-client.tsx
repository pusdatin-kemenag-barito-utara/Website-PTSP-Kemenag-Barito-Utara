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
} from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { isAdminRole } from "@/lib/constants";
import { LoginDropdown } from "@/components/header/login-dropdown";
import { MobileNav } from "@/components/header/mobile-nav";

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
      { label: "Katalog Layanan", href: "/layanan", icon: LayoutGrid },
      { label: "Lacak Layanan", href: "/track", icon: Search },
      { label: "Cek Sisa Cuti", href: "/cek-cuti", icon: FilePlus },
    ]
  },
  { 
    label: "Tamu", 
    href: "#", 
    icon: BookOpen,
    children: [
      { label: "Buku Tamu", href: "/buku-tamu", icon: BookOpen },
      { label: "Janji Temu", href: "/janji-temu", icon: Calendar },
    ]
  },
  { label: "Kontak", href: "/kontak", icon: PhoneCall },
];

import { m } from "framer-motion";

export function SiteHeaderClient({
  profile,
}: {
  profile: HeaderProfile | null;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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

  const dashboardHref = isAdminRole(profile?.role) ? "/admin" : "/dashboard";

  const isAdmin = isAdminRole(profile?.role);
  const isHome = pathname === "/";

  // On home page: transparent header with white text at top, white header with dark text when scrolled.
  // On other pages: always blue gradient header with white text.
  // Glassmorphism logic: stay transparent but with stronger/darker blur when scrolled
  const isDarkBg = scrolled || !isHome;
  const headerClass = isDarkBg
    ? "w-full bg-emerald-950/95 backdrop-blur-2xl border-b border-white/10 shadow-2xl shadow-black/40"
    : "w-full bg-transparent";

  // Text should be dark only if on home page, NOT scrolled, and we want a light style (not applicable here as we want dark theme)
  // But for safety, let's keep it white as we are using a dark green background.
  const needsDarkStyle = false;

  return (
    <>
      <m.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={`fixed left-0 right-0 top-0 z-50 transition-colors duration-700 ease-in-out ${headerClass}`}
        style={{ backgroundColor: isDarkBg ? "#022c22" : "transparent" }}
      >
        {/* Scroll Progress Bar (visible when scrolled) */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-[2px] transition-opacity duration-500 ${scrolled ? "opacity-100" : "opacity-0"}`}
        >
          <div className="h-full bg-emerald-500/20 rounded-full" />
        </div>

        <div className="mx-auto w-full px-4 sm:px-6 lg:px-4 xl:px-12 2xl:px-16">
          <div className="flex h-[72px] items-center justify-between gap-1.5 md:h-[84px]">
            {/* Logo (Left aligned) */}
            <div className="flex shrink-0 items-center justify-start">
              <Link
                href="/"
                className="group flex items-center gap-2 transition-transform duration-300 hover:scale-105 active:scale-95"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-md transition-all duration-500 sm:h-12 sm:w-12 xl:h-13 xl:w-13 xl:rounded-[1rem] bg-white`}
                >
                  <Image
                    src="/kemenag.svg"
                    alt="Logo Kemenag"
                    width={32}
                    height={32}
                    className="w-7 h-7 sm:w-8 h-8 xl:w-8.5 xl:h-8.5 object-contain"
                    style={{ width: "auto", height: "auto" }}
                    priority
                    loading="eager"
                  />
                </div>
                <div className="flex flex-col justify-center min-w-0 whitespace-nowrap pl-1">
                  <span className="text-[11px] sm:text-[13px] font-black tracking-[0.05em] leading-tight transition-colors duration-500 lg:hidden text-white">
                    PELAYANAN TERPADU SATU PINTU
                  </span>
                  <span className="text-[8.5px] sm:text-[10px] font-bold tracking-wider leading-tight transition-colors duration-500 lg:hidden text-emerald-100/80">
                    KEMENTERIAN AGAMA KABUPATEN BARITO UTARA
                  </span>
                  {/* Desktop text (highly responsive) */}
                  <span className="hidden lg:block text-[11px] xl:text-[13px] font-black tracking-[0.05em] leading-tight transition-colors duration-500 text-white">
                    PELAYANAN TERPADU SATU PINTU (PTSP)
                  </span>
                  <span className="hidden lg:block text-[8px] xl:text-[9px] font-bold tracking-[0.08em] leading-tight transition-colors duration-500 text-emerald-100/70">
                    KEMENTERIAN AGAMA KABUPATEN BARITO UTARA
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Nav (Right aligned with responsive gap & text) */}
            <nav className="hidden items-center justify-end gap-0.5 xl:gap-1.5 lg:flex ml-auto">
              {navItems.map((item: any) => {
                const isActive = pathname === item.href || (item.children && item.children.some((child: any) => pathname === child.href));
                const Icon = item.icon;
                const hasChildren = !!item.children;
                
                return (
                  <div key={item.label} className="relative group" tabIndex={0} data-nav-dropdown>
                    {hasChildren ? (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setOpenDropdown(openDropdown === item.label ? null : item.label);
                        }}
                        className={`relative flex items-center gap-1.5 xl:gap-2.5 rounded-xl px-2.5 py-2 xl:px-4 xl:py-2.5 text-[12.5px] xl:text-[14px] font-bold transition-all duration-500 cursor-pointer ${
                          isActive || openDropdown === item.label
                            ? "!text-white"
                            : "!text-white/70 hover:!text-white"
                        }`}
                        style={{
                          color: isActive || openDropdown === item.label ? "white" : "rgba(255,255,255,0.7)",
                        }}
                      >
                        {/* Active/Hover Background Pill */}
                        <div
                          className={`absolute inset-0 rounded-xl transition-all duration-500 ${
                            isActive || openDropdown === item.label
                              ? "bg-white/10 opacity-100 shadow-inner"
                              : "bg-transparent opacity-0 group-hover:bg-white/5 group-hover:opacity-100"
                          }`}
                        />

                        <Icon
                          className={`relative z-10 h-4 w-4 transition-all duration-500 ${isActive || openDropdown === item.label ? "scale-110 opacity-100" : "opacity-60 group-hover:scale-110 group-hover:opacity-100"}`}
                        />
                        <span
                          className="relative z-10 whitespace-nowrap flex items-center gap-1"
                          style={{ color: "inherit" }}
                        >
                          {item.label}
                          <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${openDropdown === item.label ? "rotate-180 opacity-100" : "opacity-70 group-hover:opacity-100"}`} />
                        </span>

                        {/* Subtle active indicator dot */}
                        {isActive && (
                          <div className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full transition-all duration-500 bg-white" />
                        )}
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setOpenDropdown(null)}
                        className={`relative flex items-center gap-1.5 xl:gap-2.5 rounded-xl px-2.5 py-2 xl:px-4 xl:py-2.5 text-[12.5px] xl:text-[14px] font-bold transition-all duration-500 ${
                          isActive
                            ? "!text-white"
                            : "!text-white/70 hover:!text-white"
                        }`}
                        style={{
                          color: isActive ? "white" : "rgba(255,255,255,0.7)",
                        }}
                      >
                        {/* Active/Hover Background Pill */}
                        <div
                          className={`absolute inset-0 rounded-xl transition-all duration-500 ${
                            isActive
                              ? "bg-white/10 opacity-100 shadow-inner"
                              : "bg-transparent opacity-0 group-hover:opacity-100 group-hover:bg-white/5"
                          }`}
                        />

                        <Icon
                          className={`relative z-10 h-4 w-4 transition-all duration-500 ${isActive ? "scale-110" : "opacity-60 group-hover:scale-110 group-hover:opacity-100"}`}
                        />
                        <span
                          className="relative z-10 whitespace-nowrap flex items-center gap-1"
                          style={{ color: "inherit" }}
                        >
                          {item.label}
                        </span>

                        {/* Subtle active indicator dot */}
                        {isActive && (
                          <div className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full transition-all duration-500 bg-white" />
                        )}
                      </Link>
                    )}

                    {/* Desktop Dropdown Menu */}
                    {hasChildren && (
                      <div 
                        className={`absolute top-full left-0 pt-4 z-50 transition-all duration-300 ${
                          openDropdown === item.label 
                            ? "opacity-100 pointer-events-auto" 
                            : "opacity-0 pointer-events-none"
                        }`}
                      >
                        <div 
                          className={`min-w-[220px] w-max bg-white backdrop-blur-xl border border-slate-100 rounded-2xl p-2 shadow-2xl shadow-emerald-900/10 flex flex-col gap-1 origin-top-left transition-all duration-300 ${
                            openDropdown === item.label ? "translate-y-0 scale-100" : "translate-y-2 scale-95"
                          }`}
                        >
                          {item.children.map((child: any) => {
                            const isChildActive = pathname === child.href;
                            const ChildIcon = child.icon;
                            return (
                              <Link
                                key={child.label}
                                href={child.href}
                                onClick={() => setOpenDropdown(null)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group/child whitespace-nowrap ${
                                  isChildActive
                                    ? "bg-emerald-50 text-emerald-700 font-bold"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-emerald-600 font-semibold"
                                }`}
                              >
                                <ChildIcon className={`h-4.5 w-4.5 transition-colors ${isChildActive ? "text-emerald-600" : "text-slate-400 group-hover/child:text-emerald-500"}`} />
                                <span className="text-[13.5px]">{child.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {profile && (
                <Link
                  href={dashboardHref}
                  className={`group flex items-center gap-1.5 xl:gap-2 rounded-full px-3 py-2 xl:px-4 xl:py-2.5 text-[12px] xl:text-[13.5px] font-bold transition-all duration-300 ${
                    pathname.startsWith("/dashboard") ||
                    pathname.startsWith("/admin")
                      ? "bg-white/20 !text-white shadow-inner"
                      : "!text-white/80 hover:bg-white/10 hover:!text-white"
                  }`}
                  style={{ color: "white" }}
                >
                  <LayoutDashboard className="h-4 w-4 transition-transform duration-300 group-hover:scale-110 opacity-70 group-hover:opacity-100" />
                  <span style={{ color: "inherit" }} className="whitespace-nowrap">Dashboard</span>
                </Link>
              )}
            </nav>

            {/* Desktop CTA (Right aligned with responsive padding) */}
            <div className="hidden items-center justify-end lg:flex gap-2 xl:gap-3 ml-2">
              {profile ? (
                <div className="flex items-center gap-2 xl:gap-3">
                  <div className="flex items-center gap-1.5 xl:gap-2 rounded-full px-2.5 py-1.5 xl:px-4 xl:py-2 backdrop-blur-md transition-colors duration-300 bg-white/10 border border-white/20 text-white">
                    {isAdmin ? (
                      <Shield className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <UserCircle2 className="h-3.5 w-3.5 text-emerald-200" />
                    )}
                    <span className="text-xs xl:text-sm font-bold whitespace-nowrap">
                      {isAdmin ? "Admin" : "Pemohon"}
                    </span>
                  </div>
                  <SignOutButton />
                </div>
              ) : (
                <LoginDropdown
                  loginOpen={loginOpen}
                  setLoginOpen={setLoginOpen}
                  needsDarkStyle={false}
                />
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex items-center justify-end lg:hidden relative z-[60]">
              <button
                type="button"
                aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
                onClick={() => setMobileOpen((prev) => !prev)}
                className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border transition-all duration-500 active:scale-90 ${
                  mobileOpen
                    ? "bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/20"
                    : "border-white/20 bg-white/10 text-white hover:bg-white/20 shadow-inner"
                }`}
              >
                <div className="relative flex h-5 w-5 flex-col items-center justify-center">
                  <span
                    className={`block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                      mobileOpen ? "absolute rotate-45 scale-x-110" : "mb-1.5"
                    }`}
                  />
                  <span
                    className={`block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                      mobileOpen ? "absolute opacity-0 -translate-x-2" : ""
                    }`}
                  />
                  <span
                    className={`block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                      mobileOpen ? "absolute -rotate-45 scale-x-110" : "mt-1.5"
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </m.header>
      <MobileNav
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        needsDarkStyle={needsDarkStyle}
        pathname={pathname}
        navItems={navItems}
        profile={profile}
        dashboardHref={dashboardHref}
        isAdmin={isAdmin}
      />
    </>
  );
}
