import { useState, useEffect, useRef } from "react";
import Link from "@/lib/next-compat/link";
import { usePathname } from "@/lib/next-compat/navigation";
import { Shield, ChevronDown, User, Briefcase, Menu, X } from "lucide-react";
import {
  ADMIN_NAV,
  USER_NAV,
  PEGAWAI_NAV,
  GROUP_ICONS,
} from "@/lib/navigation";
import { NavLink } from "./_components/nav-link";
import { SidebarFooter } from "./_components/sidebar-footer";

type SidebarMode = "admin" | "pegawai" | "user";

export function DashboardSidebar({ mode = "user", userNip = "" }: { mode?: SidebarMode; isAdmin?: boolean; userNip?: string }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    Utama: true,
  });
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  // Backward compatibility wrapper (in case some old code passes isAdmin)
  const currentMode = arguments[0]?.isAdmin ? "admin" : mode;
  
  let navItems = currentMode === "admin" ? ADMIN_NAV : (currentMode === "pegawai" ? PEGAWAI_NAV : USER_NAV);

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
    const isPejabat = PEJABAT_NIPS.includes(userNip);
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
      {/* Mobile Top Bar (Full Width Top Bar) */}
      <div className="md:hidden sticky top-0 z-[90] -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between shadow-xs mb-4 transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${currentMode === "admin" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : (currentMode === "pegawai" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : "bg-teal-500/10 text-teal-600 dark:text-teal-400")}`}>
            {currentMode === "admin" ? (
              <Shield className="h-4.5 w-4.5" />
            ) : currentMode === "pegawai" ? (
              <Briefcase className="h-4.5 w-4.5" />
            ) : (
              <User className="h-4.5 w-4.5" />
            )}
          </div>
          <p className="text-xs sm:text-sm font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
            {currentMode === "admin" ? "Menu Admin" : (currentMode === "pegawai" ? "Menu Pegawai" : "Navigasi Pemohon")}
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

      {/* Mobile Drawer Overlay with Smooth Backdrop */}
      <div 
        className={`md:hidden fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} 
        onClick={() => setIsOpen(false)} 
      />

      {/* Sidebar / Drawer */}
      <aside
        ref={sidebarRef}
        className={`
          flex flex-col w-[280px] sm:w-[320px] max-w-[85vw]
          fixed inset-y-0 right-0 z-[110] bg-transparent shadow-2xl transition-transform duration-300 cubic-bezier(0.16, 1, 0.3, 1) 
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          md:static md:translate-x-0 md:bg-transparent md:shadow-none md:z-0
          md:w-full md:max-h-[calc(100vh-7rem)] shrink-0
        `}
      >
        {/* Navigation */}
        <nav className="h-full md:h-auto rounded-l-3xl md:rounded-3xl border-l border-y md:border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl md:shadow-xs overflow-hidden flex flex-col transition-colors duration-300">
          {/* Header */}
          <div
            className="flex w-full items-center justify-between border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/70 px-5 py-4 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className={`flex h-7 w-7 items-center justify-center rounded-xl ${currentMode === "admin" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : (currentMode === "pegawai" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : "bg-teal-500/10 text-teal-600 dark:text-teal-400")}`}>
                {currentMode === "admin" ? (
                  <Shield className="h-4 w-4" />
                ) : currentMode === "pegawai" ? (
                  <Briefcase className="h-4 w-4" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              <p className="text-xs font-bold tracking-tight text-slate-800 dark:text-slate-100">
                {currentMode === "admin" ? "Menu Admin" : (currentMode === "pegawai" ? "Menu Pegawai" : "Navigasi Pemohon")}
              </p>
            </div>
            
            <button 
              onClick={() => setIsOpen(false)} 
              className="md:hidden flex h-8 w-8 items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-full transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Nav items */}
          <div
            className="overflow-y-auto flex-1 md:flex-auto md:max-h-[calc(100vh-12rem)]"
          >
            <div className="p-3 space-y-1">
              {currentMode !== "user" ? (
                <div className="space-y-1">
                  {groups.map((group: any, gi: number) => {
                    const GroupIcon = (GROUP_ICONS as any)[group];
                    const groupItems = navItems.filter(
                      (item: any) => (item.group || "") === group,
                    );
                    return (
                      <div key={group} className={gi > 0 ? "pt-1" : ""}>
                        {group && (
                          <button 
                            onClick={() => toggleGroup(group)}
                            className="mb-1 mt-2 first:mt-0 flex w-full items-center justify-between px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl transition-colors cursor-pointer group/header focus:outline-none"
                          >
                            <div className="flex items-center gap-2">
                              {GroupIcon && (
                                <GroupIcon className="h-4 w-4 text-slate-400 dark:text-slate-500 group-hover/header:text-emerald-600 dark:group-hover/header:text-emerald-400 transition-colors" />
                              )}
                              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 group-hover/header:text-slate-900 dark:group-hover/header:text-white transition-colors">
                                {group}
                              </p>
                            </div>
                            <ChevronDown 
                              className={`h-4 w-4 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${expandedGroups[group] ? 'rotate-180' : ''}`} 
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
                        {gi < groups.length - 1 && (
                          <div className="mx-3 mt-2 border-t border-slate-100 dark:border-slate-800" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-1">
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
            <SidebarFooter />
          </div>
        </nav>
      </aside>
    </>
  );
}
