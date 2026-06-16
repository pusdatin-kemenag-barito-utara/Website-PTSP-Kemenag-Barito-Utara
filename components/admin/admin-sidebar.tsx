"use client";

import Link from "next/link";
import { ChevronRight, Shield } from "lucide-react";
import { SystemHealthBadge } from "./system-health-badge";

function NavLink({
  item,
  isActive,
  onClick,
}: {
  item: any;
  isActive: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all duration-300 ${
        isActive
          ? "bg-emerald-500/15 text-emerald-400 shadow-sm border border-emerald-500/20"
          : "text-white hover:bg-white/10 border border-transparent"
      }`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-300 ${
          isActive
            ? "bg-emerald-500/20 text-emerald-400"
            : "bg-transparent text-white/70 group-hover:text-white group-hover:bg-white/10"
        }`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="flex-1 leading-tight truncate">{item.label}</span>
      {isActive && (
        <ChevronRight className="h-4 w-4 opacity-60 shrink-0 text-emerald-400" />
      )}
    </Link>
  );
}

export function AdminSidebar({
  groups,
  authorizedNav,
  pathname,
  onNavClick,
}: {
  groups: string[];
  authorizedNav: any[];
  pathname: string;
  onNavClick?: () => void;
}) {

  return (
    <div className="flex h-full flex-col">
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-900/30">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-extrabold text-white leading-tight truncate">
            PANEL ADMIN
          </p>
          <p className="text-[11px] font-semibold text-slate-500 truncate">
            PTSP KEMENAG BARITO UTARA
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
        {groups.map((group: string) => {
          const groupItems = authorizedNav.filter(
            (item: any) => (item.group || "") === group,
          );

          return (
            <div key={group}>
              {group && (
                <div className="flex w-full items-center gap-2 px-2 py-2 text-left text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#6b7280]">
                  <span className="flex-1">{group}</span>
                </div>
              )}
              <div className="space-y-1 pb-4">
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
                      onClick={onNavClick}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <SystemHealthBadge />
    </div>
  );
}
