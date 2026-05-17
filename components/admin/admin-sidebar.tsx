import Link from "next/link";
import { ChevronRight, Shield, Crown, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
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
  profile,
  isSuperAdmin,
  initials,
  onNavClick,
}: {
  groups: string[];
  authorizedNav: any[];
  pathname: string;
  profile: any;
  isSuperAdmin: boolean;
  initials: string;
  onNavClick?: () => void;
}) {
  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

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

      {/* User info + Logout */}
      <div className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-3">
        {/* Profile card */}
        <div className="flex items-center gap-3 rounded-2xl bg-white border border-slate-200/60 px-3 py-3 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 border border-emerald-200/50 text-xs font-black text-[#059669]">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-800 truncate">
              {profile?.fullName || profile?.email || "Admin"}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              {isSuperAdmin ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600">
                  <Crown className="h-3 w-3" />
                  Super Admin
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#059669]">
                  <Shield className="h-3 w-3" />
                  Administrator
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Logout button */}
        <button
          type="button"
          onClick={handleSignOut}
          className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-bold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 border border-transparent hover:border-red-100"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors group-hover:bg-red-100 group-hover:text-red-600">
            <LogOut className="h-4 w-4" />
          </span>
          <span>Keluar dari Panel</span>
        </button>
      </div>
    </div>
  );
}
