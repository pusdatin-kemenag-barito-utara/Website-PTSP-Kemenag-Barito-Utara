import { useState, useEffect, useRef } from "react";
import Link from "@/lib/next-compat/link";
import { usePathname } from "@/lib/next-compat/navigation";
import { Shield, ChevronDown, User, Briefcase, Menu, X, Home, LogOut } from "lucide-react";
import { signOutAction } from "@/lib/actions/auth/sign-out";
import { BottomNavPemohon } from "./_components/bottom-nav-pemohon";
import { BottomNavPegawai } from "./_components/bottom-nav-pegawai";
import {
  ADMIN_NAV,
  USER_NAV,
  PEGAWAI_NAV,
  GROUP_ICONS,
} from "@/lib/navigation";
import { NavLink } from "./_components/nav-link";
import { SidebarFooter } from "./_components/sidebar-footer";

type SidebarMode = "admin" | "pegawai" | "user";

export function DashboardSidebar({
  mode = "user",
  userNip = "",
  isAdmin = false,
}: {
  mode?: SidebarMode;
  isAdmin?: boolean;
  userNip?: string;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    Utama: true,
    "Layanan ASN": true,
    "E-LK Harian": true,
    "Pengaturan": true,
    "Master Data": true,
    "Manajemen Pengguna": true,
    "Sistem": true,
  });
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  const currentMode = mode;
  let navItems = currentMode === "admin" ? ADMIN_NAV : (currentMode === "pegawai" ? PEGAWAI_NAV : USER_NAV);

  const handleUserSignOut = async () => {
    try {
      document.cookie = "ptsp-auth=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "ptsp-auth-access-token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {}
    try {
      await signOutAction("/login/masyarakat");
    } catch (e) {}
    window.location.replace("/login/masyarakat");
  };

  if (currentMode === "pegawai") {
    const PEJABAT_NIPS = [
      "197809042007101005", // Sony
      "198110082005011002", // Handayani
      "197101231998031004", // Bakti
      "197304062005011008", // Supian
      "198002022005011008", // Almubasir
      "197011032003121002", // Hasan
      "198210022009011011", // Wandi
      "197311212001121001"  // Arbaja
    ];
    const isPejabat = PEJABAT_NIPS.includes(userNip) || isAdmin;
    navItems = navItems.filter((item: any) => !item.restrictedToPejabat || isPejabat);
  }

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Otomatis buka accordion grup menu yang mencakup pathname aktif
  useEffect(() => {
    if (!pathname || currentMode === "user") return;

    // Cari item navigasi yang cocok dengan URL saat ini
    const activeItem = navItems.find((item: any) => {
      if (item.href === "/admin" || item.href === "/pegawai") {
        return pathname === item.href;
      }
      return pathname.startsWith(item.href);
    });

    if (activeItem && activeItem.group) {
      setExpandedGroups((prev) => {
        if (prev[activeItem.group!]) return prev; // Mencegah re-render tak terbatas
        return {
          ...prev,
          [activeItem.group!]: true,
        };
      });
    }
  }, [pathname, navItems, currentMode]);

  // Close on pathname change (extra safety)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const groups = currentMode !== "user"
    ? Array.from(new Set(navItems.map((item: any) => item.group || "")))
    : [""];

  return (
    <>
      {/* Mobile Top Bar */}
      {currentMode === "user" ? (
        <div className="md:hidden fixed top-0 inset-x-0 z-[90] h-14 px-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between shadow-2xs transition-all duration-300">
          <Link href="/masyarakat" className="flex items-center gap-2.5 active:scale-95 transition-transform">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800/40 p-1 shrink-0 shadow-2xs">
              <img 
                src="/kemenag.svg" 
                alt="Kemenag Barito Utara" 
                className="h-full w-full object-contain" 
                onError={(e) => { e.currentTarget.style.display = 'none'; }} 
              />
            </div>
            <div>
              <p className="text-xs font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                PTSP Kemenag
              </p>
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 leading-none">
                Kab. Barito Utara
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              prefetch={false}
              title="Kembali ke Portal Website Utama"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-600 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-400 text-xs font-bold border border-slate-200/70 dark:border-slate-700/70 transition-all active:scale-95 shadow-2xs"
            >
              <Home className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[11px] font-bold">Portal</span>
            </Link>
            <button
              type="button"
              onClick={handleUserSignOut}
              title="Keluar dari Akun"
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100/80 dark:bg-slate-800/80 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200/70 dark:border-slate-700/70 transition-all active:scale-95 cursor-pointer shadow-2xs"
              aria-label="Keluar dari akun"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : currentMode === "pegawai" ? (
        <div className="md:hidden fixed top-0 inset-x-0 z-[90] h-14 px-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between shadow-2xs transition-all duration-300">
          <Link href="/pegawai" className="flex items-center gap-2.5 active:scale-95 transition-transform">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800/40 p-1 shrink-0 shadow-2xs">
              <img 
                src="/kemenag.svg" 
                alt="Kemenag Barito Utara" 
                className="h-full w-full object-contain" 
                onError={(e) => { e.currentTarget.style.display = 'none'; }} 
              />
            </div>
            <div>
              <p className="text-xs font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                Portal Pegawai
              </p>
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 leading-none">
                Kab. Barito Utara
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              prefetch={false}
              title="Kembali ke Portal Website Utama"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-600 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-400 text-xs font-bold border border-slate-200/70 dark:border-slate-700/70 transition-all active:scale-95 shadow-2xs"
            >
              <Home className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[11px] font-bold">Portal</span>
            </Link>
            <button
              type="button"
              onClick={handleUserSignOut}
              title="Keluar dari Akun"
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100/80 dark:bg-slate-800/80 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200/70 dark:border-slate-700/70 transition-all active:scale-95 cursor-pointer shadow-2xs"
              aria-label="Keluar dari akun"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="md:hidden fixed top-0 inset-x-0 z-[90] px-4 sm:px-6 py-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between shadow-xs transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Shield className="h-4.5 w-4.5" />
            </div>
            <p className="text-xs sm:text-sm font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
              Menu Admin
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-slate-700 transition-colors focus:outline-none cursor-pointer border border-emerald-100 dark:border-slate-700"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Mobile Drawer Overlay with Smooth Backdrop (Only for admin) */}
      {currentMode === "admin" && (
        <div 
          className={`md:hidden fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} 
          onClick={() => setIsOpen(false)} 
        />
      )}

      {/* Sidebar / Drawer */}
      <aside
        ref={sidebarRef}
        className={`
          ${currentMode === "admin" ? "flex" : "hidden md:flex"} flex-col w-[280px] sm:w-[320px] max-w-[85vw]
          fixed inset-y-0 right-0 z-[110] bg-transparent shadow-2xl transition-transform duration-300 cubic-bezier(0.16, 1, 0.3, 1) 
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          md:static md:translate-x-0 md:bg-transparent md:shadow-none md:z-0
          md:w-full md:h-screen shrink-0
        `}
      >
        {/* Navigation */}
        <nav className="h-full md:h-screen rounded-l-3xl md:rounded-none border-l border-y md:border-y-0 md:border-l-0 md:border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl md:shadow-none overflow-hidden flex flex-col pb-[env(safe-area-inset-bottom)] transition-colors duration-300">
          {/* Header */}
          <div className="flex w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 px-4 py-3.5 transition-colors">
            <Link
              href={currentMode === "pegawai" ? "/pegawai" : currentMode === "admin" ? "/admin" : "/masyarakat"}
              className="flex items-center gap-2.5 group min-w-0"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800/40 p-1 shrink-0">
                <img 
                  src="/kemenag.svg" 
                  alt="Kemenag Barito Utara" 
                  className="h-full w-full object-contain" 
                  onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-tight truncate">
                  PTSP Kemenag
                </p>
                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-none mt-0.5 truncate">
                  {currentMode === "admin" ? "Panel Administrator" : (currentMode === "pegawai" ? "Portal Pegawai" : "Portal Pemohon")}
                </p>
              </div>
            </Link>
            
            <button 
              onClick={() => setIsOpen(false)} 
              className="md:hidden flex h-7 w-7 items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-md transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Nav items */}
          <div className="overflow-y-auto flex-1 md:flex-auto md:max-h-[calc(100vh-10.5rem)]">
            <div className="p-3 space-y-1.5">
              {currentMode !== "user" ? (
                <div className="space-y-1.5">
                  {groups.map((group: any) => {
                    const GroupIcon = (GROUP_ICONS as any)[group];
                    const groupItems = navItems.filter(
                      (item: any) => (item.group || "") === group,
                    );
                    return (
                      <div key={group} className="space-y-0.5">
                        {group && (
                          <button 
                            onClick={() => toggleGroup(group)}
                            className="mb-1 mt-2 first:mt-0 flex w-full items-center justify-between px-2.5 py-1 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-md transition-colors cursor-pointer group/header focus:outline-none"
                          >
                            <div className="flex items-center gap-1.5">
                              {GroupIcon && (
                                <GroupIcon className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 transition-colors" />
                              )}
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 group-hover/header:text-slate-700 dark:group-hover/header:text-slate-300 transition-colors">
                                {group}
                              </span>
                            </div>
                            <ChevronDown 
                              className={`h-3 w-3 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${expandedGroups[group] ? 'rotate-180' : ''}`} 
                            />
                          </button>
                        )}
                        <div className={`space-y-0.5 overflow-hidden transition-all duration-300 ${(!group || expandedGroups[group]) ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                          {groupItems.map((item: any) => {
                            const isActive =
                              (item.href === "/admin" || item.href === "/pegawai")
                                ? pathname === item.href
                                : pathname.startsWith(item.href);
                            return (
                              <NavLink
                                key={item.href}
                                item={item}
                                isActive={isActive}
                                onClick={() => setIsOpen(false)}
                              />
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="px-2.5 py-1 mb-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Menu Pemohon
                    </span>
                  </div>
                  {navItems.map((item: any) => {
                    const isActive =
                      item.href === "/dashboard" || item.href === "/masyarakat" || item.href === "/masyarakat/pengajuan"
                        ? pathname === item.href
                        : pathname.startsWith(item.href);
                    return (
                      <NavLink
                        key={item.href}
                        item={item}
                        isActive={isActive}
                        onClick={() => setIsOpen(false)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <div className="mt-auto">
            <SidebarFooter isAdmin={isAdmin} mode={currentMode} />
          </div>
        </nav>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      {currentMode === "user" && <BottomNavPemohon />}
      {currentMode === "pegawai" && <BottomNavPegawai />}
    </>
  );
}
