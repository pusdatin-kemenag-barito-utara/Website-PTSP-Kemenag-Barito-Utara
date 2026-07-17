"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
      <div className="md:hidden flex items-center justify-between bg-white border border-slate-200/80 rounded-2xl px-4 py-3 shadow-sm mb-1">
        <div className="flex items-center gap-3">
          <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${currentMode === "admin" ? "bg-[#059669]/10" : (currentMode === "pegawai" ? "bg-blue-600/10" : "bg-emerald-600/10")}`}>
            {currentMode === "admin" ? (
              <Shield className="h-4 w-4 text-[#059669]" />
            ) : currentMode === "pegawai" ? (
              <Briefcase className="h-4 w-4 text-blue-600" />
            ) : (
              <User className="h-4 w-4 text-emerald-600" />
            )}
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-700">
            {currentMode === "admin" ? "Menu Admin" : (currentMode === "pegawai" ? "Menu Pegawai" : "Menu Utama")}
          </p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 -mr-2 text-slate-500 hover:text-slate-900 transition-colors focus:outline-none"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      <div 
        className={`md:hidden fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} 
        onClick={() => setIsOpen(false)} 
      />

      {/* Sidebar / Drawer */}
      <aside
        ref={sidebarRef}
        className={`
          flex flex-col w-[280px] sm:w-[320px] max-w-[85vw]
          fixed inset-y-0 right-0 z-[110] bg-transparent shadow-2xl transition-transform duration-300 transform 
          ${isOpen ? "translate-x-0" : "translate-x-full"}
          md:static md:translate-x-0 md:bg-transparent md:shadow-none md:z-0
          md:sticky md:top-6 md:self-start md:max-h-[calc(100vh-6rem)] md:pb-2 md:w-full
        `}
      >
        {/* Navigation */}
        <nav className="h-full md:h-auto rounded-l-2xl md:rounded-2xl border-l border-y md:border border-slate-200/80 bg-white shadow-sm overflow-hidden flex flex-col transition-all">
          {/* Header */}
          <div
            className="flex w-full items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-4 md:px-4 md:py-3 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className={`flex h-6 w-6 md:h-6 md:w-6 items-center justify-center rounded-lg ${currentMode === "admin" ? "bg-[#059669]/10" : (currentMode === "pegawai" ? "bg-blue-600/10" : "bg-emerald-600/10")}`}>
                {currentMode === "admin" ? (
                  <Shield className="h-3.5 w-3.5 text-[#059669]" />
                ) : currentMode === "pegawai" ? (
                  <Briefcase className="h-3.5 w-3.5 text-blue-600" />
                ) : (
                  <User className="h-3.5 w-3.5 text-emerald-600" />
                )}
              </div>
              <p className="text-[10px] md:text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                {currentMode === "admin" ? "Menu Admin" : (currentMode === "pegawai" ? "Menu Pegawai" : "Menu Utama")}
              </p>
            </div>
            
            <button 
              onClick={() => setIsOpen(false)} 
              className="md:hidden p-1.5 -mr-1.5 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Nav items */}
          <div
            className="overflow-y-auto flex-1 md:flex-auto md:overflow-visible"
          >
            <div className="p-2 space-y-1">
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
                            className="mb-1 mt-2 first:mt-0 flex w-full items-center justify-between px-3 py-1.5 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer group/header focus:outline-none"
                          >
                            <div className="flex items-center gap-1.5">
                              {GroupIcon && (
                                <GroupIcon className="h-4 w-4 text-slate-500 group-hover/header:text-emerald-600 transition-colors" />
                              )}
                              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-600 group-hover/header:text-slate-900 transition-colors">
                                {group}
                              </p>
                            </div>
                            <ChevronDown 
                              className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${expandedGroups[group] ? 'rotate-180' : ''}`} 
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
                          <div className="mx-3 mt-2 border-t border-slate-100" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-0.5">
                  {navItems.map((item: any) => {
                    const isActive =
                      item.href === "/dashboard"
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
