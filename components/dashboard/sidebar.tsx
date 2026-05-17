"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, ChevronDown } from "lucide-react";
import {
  ADMIN_NAV,
  USER_NAV,
  GROUP_ICONS,
} from "@/lib/navigation";
import { NavLink } from "./_components/nav-link";
import { SidebarFooter } from "./_components/sidebar-footer";

export function DashboardSidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const navItems = isAdmin ? ADMIN_NAV : USER_NAV;

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

  const groups = isAdmin
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
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#059669]/10">
              <Shield className="h-3.5 w-3.5 text-[#059669]" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
              {isAdmin ? "Menu Admin" : "Menu Utama"}
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
            {isAdmin ? (
              <div className="space-y-1">
                {groups.map((group: any, gi: number) => {
                  const GroupIcon = (GROUP_ICONS as any)[group];
                  const groupItems = navItems.filter(
                    (item: any) => (item.group || "") === group,
                  );
                  return (
                    <div key={group} className={gi > 0 ? "pt-1" : ""}>
                      {group && (
                        <div className="mb-1 mt-2 first:mt-0 flex items-center gap-1.5 px-3">
                          {GroupIcon && (
                            <GroupIcon className="h-3 w-3 text-slate-400" />
                          )}
                          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                            {group}
                          </p>
                        </div>
                      )}
                      <div className="space-y-0.5">
                        {groupItems.map((item: any) => {
                          const isActive =
                            item.href === "/admin"
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
