"use client";

import Link from "next/link";
import { 
  X, 
  UserCircle2, 
  Shield, 
  LayoutDashboard 
} from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";

interface MobileNavProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  needsDarkStyle: boolean;
  pathname: string;
  navItems: any[];
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
    <div
      className={`fixed inset-0 z-[9999] lg:hidden transition-all duration-700 ease-in-out ${
        mobileOpen ? "visible" : "invisible pointer-events-none"
      }`}
    >
      {/* Backdrop with extreme blur */}
      <div
        className={`absolute inset-0 bg-[#022c22]/60 backdrop-blur-2xl transition-opacity duration-700 ${
          mobileOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Main Panel */}
      <div
        className={`absolute right-0 top-0 h-full w-[320px] max-w-[90%] bg-gradient-to-b from-[#022c22] to-[#047857] shadow-2xl transition-transform duration-700 cubic-bezier(0.34, 1.56, 0.64, 1) border-l border-white/10 ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Decorative background elements */}
        <div className="absolute -left-20 top-40 h-64 w-64 rounded-full bg-emerald-500/10 blur-[80px]" />
        <div className="absolute -right-20 bottom-20 h-80 w-80 rounded-full bg-emerald-600/10 blur-[100px]" />

        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="px-6 pt-8 pb-6 border-b border-white/5 bg-white/5 backdrop-blur-md">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30">
                       <UserCircle2 className="h-8 w-8" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400/80">Menu Utama</p>
                       <h3 className="text-2xl font-extrabold text-white tracking-tight">Portal PTSP</h3>
                    </div>
                </div>
                <button 
                  onClick={() => setMobileOpen(false)}
                  className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 text-white/40 active:scale-90 transition-transform border border-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 no-scrollbar relative z-10">
            <nav className="flex flex-col gap-2.5">
              {navItems.map((item, idx) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    style={{ transitionDelay: `${idx * 40}ms` }}
                    className={`group flex items-center gap-4 rounded-2xl px-5 py-4 text-[15px] font-bold transition-all duration-300 ${
                      mobileOpen ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
                    } ${
                      isActive
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-xl shadow-emerald-500/30 border border-white/10"
                        : "text-white/60 hover:bg-white/5 hover:text-white border border-transparent"
                    }`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 ${isActive ? "bg-white/20 text-white" : "bg-white/5 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white"}`}>
                       <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? "stroke-[2.5px]" : ""}`} />
                    </div>
                    <span 
                      className={`tracking-wide ${isActive ? "font-extrabold text-white" : "font-medium text-white/70"}`}
                      style={{ color: isActive ? "#fff" : "rgba(255,255,255,0.7)" }}
                    >
                      {item.label}
                    </span>
                  </Link>
                );
              })}
              
              {profile && (
                <Link
                  href={dashboardHref}
                  onClick={() => setMobileOpen(false)}
                  style={{ 
                    transitionDelay: `${navItems.length * 40}ms`,
                    color: "rgba(255,255,255,0.6)" 
                  }}
                  className={`group flex items-center gap-4 rounded-2xl px-5 py-4 text-[15px] font-medium tracking-wide transition-all duration-300 ${
                    mobileOpen ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
                  } text-white/60 hover:bg-white/5 hover:text-white`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white">
                    <LayoutDashboard className="h-5 w-5 flex-shrink-0" />
                  </div>
                  Dashboard
                </Link>
              )}
            </nav>

            <div className={`mt-10 mb-6 transition-all duration-700 ${mobileOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-900/80 to-[#022c22] p-6 shadow-2xl border border-white/5 backdrop-blur-md">
                {/* Decoration for access area */}
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/20 blur-2xl" />
                
                <p className="relative z-10 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400/80 mb-5">Pilih Mode Akses</p>
                
                {profile ? (
                  <div className="relative z-10 flex flex-col gap-4">
                    <div className="flex items-center gap-4 rounded-2xl bg-white/5 px-5 py-4 border border-white/10 backdrop-blur-sm">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                        {isAdmin ? <Shield className="h-6 w-6" /> : <UserCircle2 className="h-6 w-6" />}
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400/60">Akun Aktif</p>
                         <p className="text-sm font-bold text-white tracking-tight">{isAdmin ? "Administrator" : "Pemohon Layanan"}</p>
                      </div>
                    </div>
                    <SignOutButton />
                  </div>
                ) : (
                  <div className="relative z-10 grid grid-cols-2 gap-3">
                    <Link
                      href="/login/pemohon"
                      onClick={() => setMobileOpen(false)}
                      className="group flex flex-col items-center justify-center gap-3 rounded-[1.75rem] bg-white/5 p-5 transition-all duration-300 hover:bg-emerald-500 hover:shadow-xl border border-white/5"
                    >
                      <UserCircle2 className="h-8 w-8 text-emerald-400 group-hover:text-white transition-all duration-300 group-hover:scale-110" />
                      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/80">Pemohon</span>
                    </Link>
                    <Link
                      href="/login/petugas"
                      onClick={() => setMobileOpen(false)}
                      className="group flex flex-col items-center justify-center gap-3 rounded-[1.75rem] bg-white/5 p-5 transition-all duration-300 hover:bg-emerald-600 hover:shadow-xl border border-white/5"
                    >
                      <Shield className="h-8 w-8 text-emerald-400/60 group-hover:text-white transition-all duration-300 group-hover:scale-110" />
                      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/80">Petugas</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
