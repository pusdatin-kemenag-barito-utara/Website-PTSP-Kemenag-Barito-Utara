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
          ? "bg-emerald-50/80 text-[#059669] shadow-sm shadow-emerald-100/50 border border-emerald-100/50"
          : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 border border-transparent"
      }`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-300 ${
          isActive
            ? "bg-white shadow-sm text-[#059669]"
            : "bg-transparent text-slate-400 group-hover:text-slate-600 group-hover:bg-white group-hover:shadow-sm"
        }`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="flex-1 leading-tight truncate">{item.label}</span>
      {isActive && (
        <ChevronRight className="h-4 w-4 opacity-60 shrink-0 text-[#059669]" />
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
      <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-100">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 shadow-lg shadow-emerald-900/20">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-extrabold text-slate-900 leading-tight truncate">
            PANEL ADMIN
          </p>
          <p className="text-[11px] font-semibold text-slate-500 truncate">
            PTSP KEMENAG BARITO UTARA
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {groups.map((group: string) => {
          const groupItems = authorizedNav.filter(
            (item: any) => (item.group || "") === group,
          );
          return (
            <div key={group}>
              {group && (
                <div className="mb-3 flex items-center gap-2 px-2">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
                    {group}
                  </p>
                </div>
              )}
              <div className="space-y-1">
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
