import { useState, useEffect } from "react";
import Image from "@/lib/next-compat/image";
import Link from "@/lib/next-compat/link";
import { usePathname } from "@/lib/next-compat/navigation";
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

import { motion, AnimatePresence } from "framer-motion";

export function SiteHeaderClient({
  profile,
  pathname: propPathname,
}: {
  profile: HeaderProfile | null;
  pathname?: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const routerPathname = usePathname();
  const rawPath = propPathname || routerPathname || "";
  const normalizedPath = rawPath.replace(/\/$/, "");
  const isHome = normalizedPath === "" || normalizedPath === "/";
  const pathname = rawPath;
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const [activeProfile, setActiveProfile] = useState<any>(profile || null);

  useEffect(() => {
    setActiveProfile(profile || null);
  }, [profile]);

  useEffect(() => {
    if (!activeProfile && typeof document !== "undefined") {
      const cookies = document.cookie.split("; ");
      const ptspAuth = cookies.find((row) => row.startsWith("ptsp-auth="));
      const ptspAccess = cookies.find((row) => row.startsWith("ptsp-auth-access-token="));
      const rawToken = ptspAuth ? ptspAuth.split("=")[1] : (ptspAccess ? ptspAccess.split("=")[1] : "");

      if (rawToken) {
        try {
          const token = decodeURIComponent(rawToken);
          const parts = token.split(".");
          if (parts.length === 3) {
            const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
            const json = decodeURIComponent(
              atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
            );
            const payload = JSON.parse(json);
            if (payload && (payload.role || payload.user_id || payload.sub)) {
              setActiveProfile({
                role: payload.role || payload.user_metadata?.role || "user",
                name: payload.nama || payload.user_metadata?.name || payload.user_metadata?.full_name || "Pemohon",
                email: payload.email || "",
              });
              return;
            }
          }
        } catch {}
      }

      try {
        const stored = localStorage.getItem("ptsp-auth-user");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && (parsed.role || parsed.user_id || parsed.id)) {
            setActiveProfile({
              role: parsed.role || "user",
              name: parsed.nama || parsed.name || "Pemohon",
              email: parsed.email || "",
            });
          }
        }
      } catch {}
    }
  }, [activeProfile]);

  const dashboardHref = isAdminRole(activeProfile?.role)
    ? "/admin"
    : activeProfile?.role === "pegawai"
      ? "/pegawai"
      : "/masyarakat";

  let dashboardLabel = "Dashboard";
  if (activeProfile) {
    if (isAdminRole(activeProfile.role)) dashboardLabel = "DASHBOARD PETUGAS";
    else if (activeProfile.role === "pegawai") dashboardLabel = "DASHBOARD PEGAWAI";
    else if (activeProfile.role === "user") dashboardLabel = "DASHBOARD PEMOHON";
    else if (activeProfile.role)
      dashboardLabel = `DASHBOARD ${activeProfile.role.toUpperCase()}`;
  }

  const isAdmin = isAdminRole(activeProfile?.role);
  const isPegawai = activeProfile?.role === "pegawai";

  let badgeLabel = "Pemohon";
  if (isAdmin) badgeLabel = "Petugas";
  else if (isPegawai) badgeLabel = "Pegawai";

  const isLightHeader = isScrolled || !isHome;

  return (
    <>
      <header
        className={`w-full z-[100] transition-all duration-300 ${
          isHome
            ? `fixed top-0 left-0 right-0 ${
                isScrolled
                  ? "bg-white/95 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 shadow-xs"
                  : "bg-transparent border-b border-transparent shadow-none"
              }`
            : "sticky top-0 left-0 right-0 bg-white/95 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 shadow-xs"
        }`}
      >
        {isLightHeader && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
        )}
        <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-12 xl:px-16">
          {/* Top Header Bar */}
          <div className="flex items-center justify-between py-2.5 lg:py-4">
            {/* Logo */}
            <Link href="/" className="flex min-w-0 items-center gap-3 group">
              <span className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl p-2 transition-all duration-300 ${
                isLightHeader
                  ? "bg-slate-100/90 dark:bg-white/10 ring-1 ring-slate-200/80 dark:ring-white/20 group-hover:bg-slate-200/80 dark:group-hover:bg-white/15"
                  : "bg-white/10 ring-1 ring-white/20 group-hover:bg-white/15"
              }`}>
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
                <p className={`text-xs sm:text-[13px] lg:text-sm font-black tracking-wide flex items-center gap-1 transition-colors duration-200 ${
                  isLightHeader ? "text-slate-900 dark:text-white" : "text-white"
                }`}>
                  PTSP Si{" "}
                  <Image
                    src="/atak.png"
                    alt="ATAK"
                    width={48}
                    height={20}
                    className="h-[1.05em] w-auto object-contain inline-block"
                    style={{ height: "1.05em", width: "auto" }}
                  />
                </p>
                <div className={`mt-0.5 text-[10px] sm:text-[11px] lg:text-[12px] font-bold leading-tight transition-colors duration-200 ${
                  isLightHeader ? "text-emerald-700 dark:text-emerald-300/90" : "text-emerald-300/90"
                }`}>
                  <div className={`block sm:hidden text-[9px] font-black uppercase tracking-tight ${
                    isLightHeader ? "text-emerald-700 dark:text-emerald-300" : "text-emerald-300"
                  }`}>
                    KEMENAG KABUPATEN BARITO UTARA
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
                  style={{ width: "96px", height: "26px" }}
                  className="h-6 w-auto object-contain drop-shadow-md -translate-y-0.5"
                  unoptimized
                />
                <div className={`hidden 2xl:block text-[10.5px] font-bold leading-tight transition-colors duration-200 ${
                  isLightHeader ? "text-slate-700 dark:text-white/90" : "text-white/90"
                }`}>
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
                <HeaderControls isLightHeader={isLightHeader} />
              </div>

              {/* CTAs */}
              <div className="hidden lg:flex items-center gap-3">
                {activeProfile ? (
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 rounded-full px-4 py-2 border transition-colors duration-200 ${
                      isLightHeader
                        ? "bg-slate-100 dark:bg-white/10 border-slate-200 dark:border-white/20 text-slate-800 dark:text-white"
                        : "bg-white/10 border-white/20 text-white"
                    }`}>
                      {isAdmin ? (
                        <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      ) : isPegawai ? (
                        <Briefcase className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <UserCircle2 className="h-4 w-4 text-slate-500 dark:text-slate-300" />
                      )}
                      <span className="text-xs font-bold">{badgeLabel}</span>
                    </div>
                    <Link
                      href={dashboardHref}
                      className="group relative flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-[11px] font-black uppercase tracking-[0.1em] text-white transition-all hover:shadow-[0_8px_20px_-6px_rgba(16,185,129,0.5)] active:scale-95"
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
                className={`relative z-[101] flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl border shadow-xs transition active:scale-95 lg:hidden cursor-pointer ${
                  isLightHeader
                    ? "border-slate-200 dark:border-white/20 bg-slate-100/90 dark:bg-white/10 text-slate-800 dark:text-white"
                    : "border-white/20 bg-white/10 text-white"
                }`}
              >
                {mobileOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
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
                      data-nav-dropdown
                      onMouseEnter={() =>
                        hasChildren && setOpenDropdown(item.label)
                      }
                      onMouseLeave={() => hasChildren && setOpenDropdown(null)}
                    >
                      {hasChildren ? (
                        <div
                          onClick={() => setOpenDropdown(isOpen ? null : item.label)}
                          className={`group inline-flex cursor-pointer flex-shrink-0 items-center gap-1.5 px-3 py-2 text-[13px] font-bold uppercase tracking-tight transition-colors duration-200 ${
                            active || isOpen
                              ? "text-emerald-600 dark:text-emerald-400"
                              : isLightHeader
                                ? "text-slate-700 hover:text-emerald-600 dark:text-white/90 dark:hover:text-emerald-400"
                                : "text-white/90 hover:text-emerald-400"
                          }`}
                        >
                          {item.label}
                          <ChevronDown
                            className={`h-3 w-3 transition-transform duration-300 ${
                              isOpen
                                ? "rotate-180 text-emerald-600 dark:text-emerald-400"
                                : isLightHeader
                                  ? "text-slate-400 group-hover:text-emerald-600 dark:text-white/70 dark:group-hover:text-emerald-400"
                                  : "text-white/70 group-hover:text-emerald-400"
                            }`}
                          />

                          {/* Active Indicator Underline */}
                          {active && (
                            <div className="absolute -bottom-0.5 left-3 right-6 h-[2.5px] rounded-full bg-emerald-600 dark:bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.7)]" />
                          )}
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          target={item.external ? "_blank" : undefined}
                          rel={item.external ? "noopener noreferrer" : undefined}
                          className={`relative inline-flex flex-shrink-0 items-center gap-1.5 px-3 py-2 text-[13px] font-bold uppercase tracking-tight transition-colors duration-200 ${
                            active
                              ? "text-emerald-600 dark:text-emerald-400"
                              : isLightHeader
                                ? "text-slate-700 hover:text-emerald-600 dark:text-white/90 dark:hover:text-emerald-400"
                                : "text-white/90 hover:text-emerald-400"
                          }`}
                        >
                          {item.label}
                          {active && (
                            <div className="absolute -bottom-0.5 left-3 right-3 h-[2.5px] rounded-full bg-emerald-600 dark:bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.7)]" />
                          )}
                        </Link>
                      )}

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {hasChildren && isOpen && (
                          <motion.div
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
                            <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white/95 dark:bg-slate-900/95 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
                              <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl" />
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
                                        className="group/item flex items-center justify-between rounded-xl px-4 py-3 text-[11.5px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 transition-all hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-600 dark:hover:text-white"
                                      >
                                        <div className="flex items-center gap-2.5">
                                          <ChildIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400 group-hover/item:text-emerald-700 dark:group-hover/item:text-white transition-colors" />
                                          <span>{child.label}</span>
                                        </div>
                                        <ChevronDown className="h-3 w-3 -rotate-90 opacity-0 transition-all -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 text-emerald-700 dark:text-white" />
                                      </Link>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ul>

              {/* Global Search Icon UI placeholder */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className={`absolute right-0 flex h-9 w-9 items-center justify-center transition-colors mr-2 cursor-pointer ${
                  isLightHeader
                    ? "text-slate-600 hover:text-emerald-600 dark:text-white/80 dark:hover:text-emerald-400"
                    : "text-white/80 hover:text-emerald-400"
                }`}
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
        profile={activeProfile}
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
