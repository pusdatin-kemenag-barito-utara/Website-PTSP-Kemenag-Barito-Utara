import Link from "next/link";
import { X, Menu, LayoutDashboard, UserCircle2, Shield } from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import type { ElementType } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: ElementType;
}

interface MobileNavProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  needsDarkStyle: boolean;
  pathname: string;
  navItems: NavItem[];
  profile: any;
  dashboardHref: string;
  isAdmin: boolean;
}

export function MobileNav({
  mobileOpen,
  setMobileOpen,
  needsDarkStyle,
  pathname,
  navItems,
  profile,
  dashboardHref,
  isAdmin,
}: MobileNavProps) {
  return (
    <>
      <div className="flex w-1/4 items-center justify-end lg:hidden">
        <button
          type="button"
          aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
          onClick={() => setMobileOpen((prev) => !prev)}
          className={`inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-200 active:scale-90 ${
            needsDarkStyle
              ? "border-slate-200 bg-white/80 text-slate-700 hover:bg-slate-100 shadow-sm"
              : "border-white/20 bg-white/10 text-white hover:bg-white/20 shadow-inner"
          }`}
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      <div
        className={`lg:hidden grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] absolute top-[72px] md:top-[80px] left-0 w-full px-6 sm:px-10 z-40 ${
          mobileOpen
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0 pointer-events-none"
        }`}
      >
        <div className="overflow-hidden">
          <div
            className={`mb-6 mt-2 transform transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              mobileOpen ? "translate-y-0" : "-translate-y-4"
            } rounded-3xl border p-4 shadow-2xl backdrop-blur-xl ${
              needsDarkStyle
                ? "border-slate-200 bg-white/95 shadow-slate-900/10"
                : "border-white/20 bg-white/10 shadow-black/20"
            }`}
          >
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-2xl px-5 py-3.5 text-sm font-bold transition-all duration-200 ${
                      isActive
                        ? needsDarkStyle
                          ? "bg-[#1f4bb7]/10 text-[#1f4bb7]"
                          : "bg-white/20 text-white shadow-inner"
                        : needsDarkStyle
                          ? "text-slate-600 hover:bg-slate-100 hover:text-[#1f4bb7]"
                          : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
              {profile && (
                <Link
                  href={dashboardHref}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-2xl px-5 py-3.5 text-sm font-bold transition-all duration-200 ${
                    needsDarkStyle
                      ? "text-slate-600 hover:bg-slate-100 hover:text-[#1f4bb7]"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
                  Dashboard
                </Link>
              )}
            </nav>

            <div
              className={`mt-4 border-t pt-4 ${
                needsDarkStyle ? "border-slate-200" : "border-white/20"
              }`}
            >
              {profile ? (
                <div className="flex flex-col gap-3">
                  <div
                    className={`flex items-center gap-3 rounded-2xl px-5 py-3.5 ${
                      needsDarkStyle
                        ? "bg-slate-100 text-slate-700"
                        : "bg-white/10 text-white shadow-inner"
                    }`}
                  >
                    {isAdmin ? (
                      <Shield className="h-5 w-5 text-[#f0c040]" />
                    ) : (
                      <UserCircle2 className="h-5 w-5 opacity-80" />
                    )}
                    <span className="text-sm font-bold">
                      {isAdmin ? "Admin" : "Pemohon"}
                    </span>
                  </div>
                  <SignOutButton />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/login/pemohon"
                    onClick={() => setMobileOpen(false)}
                    className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-[#1f4bb7] to-[#2b67f0] p-4 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl active:translate-y-0"
                  >
                    <UserCircle2 className="h-6 w-6" />
                    Pemohon
                  </Link>
                  <Link
                    href="/login/petugas"
                    onClick={() => setMobileOpen(false)}
                    className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-[#0f8a54] to-[#0d7a4b] p-4 text-sm font-bold text-white shadow-lg shadow-green-900/20 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl active:translate-y-0"
                  >
                    <Shield className="h-6 w-6" />
                    Petugas
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
