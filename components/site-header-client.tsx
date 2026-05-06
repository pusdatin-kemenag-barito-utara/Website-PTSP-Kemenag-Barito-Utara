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
  FilePlus2,
  Phone,
  LayoutDashboard,
  LogIn,
  UserCircle2,
  Shield,
} from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { isAdminRole } from "@/lib/constants";
import { LoginDropdown } from "@/components/header/login-dropdown";
import { MobileNav } from "@/components/header/mobile-nav";

type HeaderProfile = {
  role?: string | null;
};

const navItems = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/layanan", label: "Jenis Layanan", icon: LayoutGrid },
  { href: "/track", label: "Lacak Layanan", icon: Search },
  {
    href: "/dashboard/pengajuan/baru",
    label: "Ajukan Layanan",
    icon: FilePlus2,
  },
  { href: "/kontak", label: "Kontak", icon: Phone },
];

export function SiteHeaderClient({
  profile,
}: {
  profile: HeaderProfile | null;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
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

  const dashboardHref = isAdminRole(profile?.role) ? "/admin" : "/dashboard";

  const isAdmin = isAdminRole(profile?.role);
  const isHome = pathname === "/";

  // On home page: transparent header with white text at top, white header with dark text when scrolled.
  // On other pages: always blue gradient header with white text.
  const isTransparent = isHome && !scrolled;
  const needsDarkStyle = isHome && scrolled;

  const headerClass = isHome
    ? scrolled
      ? "bg-white/95 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-2xl border-b border-slate-100"
      : "bg-transparent"
    : "bg-gradient-to-r from-[#0d2d8a] to-[#1a3fa3] shadow-lg";

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${headerClass}`}
    >
      {/* Gradient top accent */}
      <div
        className={`h-1 w-full bg-gradient-to-r from-[#1f4bb7] via-[#0f8a54] to-[#f0c040] transition-opacity duration-300 ${
          !isHome || scrolled ? "opacity-100" : "opacity-0"
        }`}
      />

      <div className="mx-auto w-full px-6 sm:px-10 lg:px-20 xl:px-24">
        <div className="flex h-[72px] items-center justify-between gap-4 md:h-[80px]">
          {/* Logo (Left aligned) */}
          <div className="flex shrink-0 items-center justify-start">
            <Link
              href="/"
              className="group flex items-center gap-2.5 transition-transform duration-300 hover:scale-105 active:scale-95"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm transition-colors duration-300 sm:h-12 sm:w-12 sm:rounded-2xl ${
                  needsDarkStyle
                    ? "bg-gradient-to-br from-[#1f4bb7]/10 to-[#1f4bb7]/5"
                    : "bg-white/10 backdrop-blur-md border border-white/20"
                }`}
              >
                <Image
                  src="/kemenag.svg"
                  alt="Logo Kemenag"
                  width={28}
                  height={28}
                  className="w-7 h-7 sm:w-8 sm:h-8 object-contain drop-shadow-md"
                  style={{ width: "auto", height: "auto" }}
                  priority
                />
              </div>
              <div className="flex flex-col justify-center min-w-0 whitespace-nowrap">
                {/* Mobile/Tablet text */}
                <span
                  className={`text-[10px] sm:text-[12px] font-black tracking-tight leading-tight transition-colors duration-300 lg:hidden ${
                    needsDarkStyle ? "text-[#1f4bb7]" : "text-white"
                  }`}
                >
                  PELAYANAN TERPADU SATU PINTU (PTSP)
                </span>
                <span
                  className={`text-[7.5px] sm:text-[9px] font-semibold tracking-wide leading-tight transition-colors duration-300 lg:hidden ${
                    needsDarkStyle ? "text-slate-500" : "text-blue-200"
                  }`}
                >
                  KEMENTERIAN AGAMA KABUPATEN BARITO UTARA
                </span>
                {/* Desktop text */}
                <span
                  className={`hidden lg:block text-[12px] font-black tracking-wider leading-tight transition-colors duration-300 ${
                    needsDarkStyle ? "text-[#1f4bb7]" : "text-white"
                  }`}
                >
                  PELAYANAN TERPADU SATU PINTU (PTSP)
                </span>
                <span
                  className={`hidden lg:block text-[9px] font-semibold tracking-wide leading-tight transition-colors duration-300 ${
                    needsDarkStyle ? "text-slate-500" : "text-blue-200"
                  }`}
                >
                  KEMENTERIAN AGAMA KABUPATEN BARITO UTARA
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav (Right aligned) */}
          <nav className="hidden items-center justify-end gap-1 lg:flex ml-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`group flex items-center gap-2 rounded-full px-4 py-2.5 text-[13.5px] font-bold transition-all duration-300 ${
                    isActive
                      ? needsDarkStyle
                        ? "bg-[#1f4bb7]/10 text-[#1f4bb7]"
                        : "bg-white/20 text-white shadow-inner"
                      : needsDarkStyle
                        ? "text-slate-600 hover:bg-slate-100 hover:text-[#1f4bb7]"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 transition-transform duration-300 ${isActive ? "scale-110" : "opacity-70 group-hover:scale-110 group-hover:opacity-100"}`}
                  />
                  {item.label}
                </Link>
              );
            })}
            {profile && (
              <Link
                href={dashboardHref}
                className={`group flex items-center gap-2 rounded-full px-4 py-2.5 text-[13.5px] font-bold transition-all duration-300 ${
                  pathname.startsWith("/dashboard") ||
                  pathname.startsWith("/admin")
                    ? needsDarkStyle
                      ? "bg-[#1f4bb7]/10 text-[#1f4bb7]"
                      : "bg-white/20 text-white shadow-inner"
                    : needsDarkStyle
                      ? "text-slate-600 hover:bg-slate-100 hover:text-[#1f4bb7]"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <LayoutDashboard className="h-4 w-4 transition-transform duration-300 group-hover:scale-110 opacity-70 group-hover:opacity-100" />
                Dashboard
              </Link>
            )}
          </nav>

          {/* Desktop CTA (Right aligned) */}
          <div className="hidden items-center justify-end lg:flex">
            {profile ? (
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center gap-2 rounded-full px-4 py-2 backdrop-blur-md transition-colors duration-300 ${
                    needsDarkStyle
                      ? "bg-slate-100 border border-slate-200 text-slate-700"
                      : "bg-white/10 border border-white/20 text-white"
                  }`}
                >
                  {isAdmin ? (
                    <Shield className="h-4 w-4 text-[#f0c040]" />
                  ) : (
                    <UserCircle2
                      className={`h-4 w-4 ${needsDarkStyle ? "text-[#1f4bb7]" : "text-blue-200"}`}
                    />
                  )}
                  <span className="text-sm font-bold">
                    {isAdmin ? "Admin" : "Pemohon"}
                  </span>
                </div>
                <SignOutButton />
              </div>
            ) : (
              <LoginDropdown
                loginOpen={loginOpen}
                setLoginOpen={setLoginOpen}
                needsDarkStyle={needsDarkStyle}
              />
            )}
          </div>

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
        </div>
      </div>
    </header>
  );
}
