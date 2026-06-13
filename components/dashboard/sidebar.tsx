"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, ChevronDown, User, Briefcase } from "lucide-react";
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
    <aside
      ref={sidebarRef}
      className="flex flex-col gap-3 md:sticky md:top-6 md:self-start md:max-h-[calc(100vh-6rem)] md:overflow-y-auto md:pb-2 w-full"
    >
      {/* Navigation */}
      <nav className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden flex flex-col transition-all">
        {/* Header - Clickable on all devices to toggle menu */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-4 py-3 hover:bg-slate-50 md:hover:bg-slate-50 md:cursor-default transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className={`flex h-6 w-6 items-center justify-center rounded-lg ${currentMode === "admin" ? "bg-[#059669]/10" : (currentMode === "pegawai" ? "bg-blue-600/10" : "bg-emerald-600/10")}`}>
              {currentMode === "admin" ? (
                <Shield className="h-3.5 w-3.5 text-[#059669]" />
              ) : currentMode === "pegawai" ? (
                <Briefcase className="h-3.5 w-3.5 text-blue-600" />
              ) : (
                <User className="h-3.5 w-3.5 text-emerald-600" />
              )}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
              {currentMode === "admin" ? "Menu Admin" : (currentMode === "pegawai" ? "Menu Pegawai" : "Menu Utama")}
            </p>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 md:hidden ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Nav items */}
        <div
          className={`overflow-hidden transition-all duration-300 md:max-h-none md:opacity-100 ${
            isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="p-2">
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
                          className="mb-1 mt-2 first:mt-0 flex w-full items-center justify-between px-3 py-1.5 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer group/header"
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
            <SidebarFooter />
          </div>
        </div>
      </nav>
    </aside>
  );
}
