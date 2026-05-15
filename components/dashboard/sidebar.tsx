"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Shield, ChevronDown } from "lucide-react";
import {
  ADMIN_NAV,
  USER_NAV,
  GROUP_ICONS,
  type NavItem,
} from "@/lib/navigation";

function NavLink({
  item,
  isActive,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ${
        isActive
          ? "bg-gradient-to-r from-[#059669] to-[#047857] text-white shadow-md shadow-emerald-500/20"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
          isActive
            ? "bg-white/20 shadow-sm shadow-white/10"
            : "bg-slate-100/80 group-hover:bg-white group-hover:shadow-sm"
        }`}
      >
        <Icon
          className={`h-3.5 w-3.5 ${
            isActive
              ? "text-white"
              : "text-slate-500 group-hover:text-slate-700"
          }`}
        />
      </span>
      <span className="flex-1 leading-tight truncate">{item.label}</span>
      {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-60 shrink-0" />}
    </Link>
  );
}

export function DashboardSidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const navItems = isAdmin ? ADMIN_NAV : USER_NAV;

  const groups = isAdmin
    ? Array.from(new Set(navItems.map((item: any) => item.group || "")))
    : [""];

  return (
    <aside className="flex flex-col gap-3 md:sticky md:top-6 md:self-start md:max-h-[calc(100vh-6rem)] md:overflow-y-auto md:pb-2">
      {/* Navigation */}
      <nav className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden flex flex-col transition-all">
        {/* Header - Clickable on all devices to toggle menu */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-4 py-3 hover:bg-slate-50 transition-colors"
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
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Nav items */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="p-2">
            {isAdmin ? (
              <div className="space-y-1">
                {groups.map((group: any, gi: number) => {
                  const GroupIcon = GROUP_ICONS[group];
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
          </div>
        </div>
      </nav>
    </aside>
  );
}
