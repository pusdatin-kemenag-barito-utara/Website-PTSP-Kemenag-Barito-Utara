"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  X, 
  UserCircle2, 
  Shield, 
  LayoutDashboard,
  ChevronDown,
  Briefcase
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
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpand = (label: string) => {
    setExpandedItems(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] lg:hidden transition-all duration-500 ease-in-out ${
        mobileOpen ? "visible" : "invisible pointer-events-none"
      }`}
    >
      {/* Dynamic Backdrop with Glass Blur and Fade effect */}
      <div
        className={`absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-500 ${
          mobileOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Main Slide Drawer Panel */}
      <div
        className={`absolute right-0 top-0 h-full w-[340px] max-w-[85vw] bg-gradient-to-b from-[#021f18]/95 via-[#032e24]/98 to-slate-950/98 shadow-[-10px_0_50px_0_rgba(0,0,0,0.6)] transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) border-l border-white/10 flex flex-col ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Abstract Glowing Accent Orbs in the background */}
        <div className="absolute -left-20 top-20 -z-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-[80px]" />
        <div className="absolute -right-20 bottom-10 -z-10 h-80 w-80 rounded-full bg-teal-500/10 blur-[100px]" />

        {/* Header Block with Branded Kemenag Logo */}
        <div className="relative border-b border-white/5 bg-white/[0.02] px-6 py-6 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* White Circular Shield Logo */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-xl shadow-emerald-950/30 border border-emerald-500/20 transition-all duration-300 hover:scale-105">
                <Image
                  src="/kemenag.svg"
                  alt="Logo Kemenag"
                  width={28}
                  height={28}
                  className="object-contain"
                  style={{ width: "auto", height: "auto" }}
                  priority
                  loading="eager"
                />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-widest text-white">PORTAL PTSP</h3>
              </div>
            </div>

            {/* Premium Glass Circle Close Button */}
            <button 
              onClick={() => setMobileOpen(false)}
              aria-label="Tutup Menu"
              className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 text-white/50 border border-white/10 transition-all duration-300 hover:bg-emerald-500 hover:text-white hover:border-emerald-400/50 hover:scale-105 active:scale-95"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Navigation Links */}
        <div className="flex-1 overflow-y-auto px-5 py-6 no-scrollbar relative z-10">
          <nav className="flex flex-col gap-2">
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              const hasChildren = !!item.children;
              const isActive = pathname === item.href || (hasChildren && item.children.some((child: any) => pathname === child.href));
              const isExpanded = expandedItems[item.label];

              return (
                <div key={item.label} className="flex flex-col gap-1">
                  {hasChildren ? (
                    <button
                      onClick={() => toggleExpand(item.label)}
                      style={{ transitionDelay: `${idx * 30}ms` }}
                      className={`group relative flex items-center justify-between rounded-2xl px-4 py-3.5 text-[14px] font-semibold transition-all duration-300 overflow-hidden w-full ${
                        mobileOpen ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
                      } ${
                        isActive || isExpanded
                          ? "bg-gradient-to-r from-emerald-500/15 to-teal-500/5 text-white border border-emerald-500/20 shadow-lg shadow-emerald-950/20"
                          : "text-white/60 hover:bg-white/5 hover:text-white border border-transparent"
                      }`}
                    >
                      {/* Left Accent Glow Line for Active State */}
                      {isActive && (
                        <div className="absolute left-0 top-1/4 h-1/2 w-[3px] rounded-r-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                      )}

                      <div className="flex items-center gap-3.5">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300 ${
                          isActive 
                            ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25" 
                            : "bg-white/5 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-105"
                        }`}>
                          <Icon className="h-4.5 w-4.5 flex-shrink-0" />
                        </div>
                        <span className={`tracking-wide transition-all ${
                          isActive ? "font-bold text-white pl-0.5" : "font-medium text-white/70 group-hover:text-white"
                        }`}>
                          {item.label}
                        </span>
                      </div>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? "rotate-180 text-white" : "text-white/50"}`} />
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      style={{ transitionDelay: `${idx * 30}ms` }}
                      className={`group relative flex items-center gap-3.5 rounded-2xl px-4 py-3.5 text-[14px] font-semibold transition-all duration-300 overflow-hidden ${
                        mobileOpen ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
                      } ${
                        isActive
                          ? "bg-gradient-to-r from-emerald-500/15 to-teal-500/5 text-white border border-emerald-500/20 shadow-lg shadow-emerald-950/20"
                          : "text-white/60 hover:bg-white/5 hover:text-white border border-transparent"
                      }`}
                    >
                      {/* Left Accent Glow Line for Active State */}
                      {isActive && (
                        <div className="absolute left-0 top-1/4 h-1/2 w-[3px] rounded-r-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                      )}

                      {/* Icon Wrapper Container */}
                      <div className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300 ${
                        isActive 
                          ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25" 
                          : "bg-white/5 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-105"
                      }`}>
                        <Icon className="h-4.5 w-4.5 flex-shrink-0" />
                      </div>

                      <span className={`tracking-wide transition-all ${
                        isActive ? "font-bold text-white pl-0.5" : "font-medium text-white/70 group-hover:text-white"
                      }`}>
                        {item.label}
                      </span>
                    </Link>
                  )}

                  {/* Render Children (Accordion Content) */}
                  {hasChildren && isExpanded && (
                    <div className="flex flex-col gap-1 pl-[52px] pr-2 pt-1 pb-2">
                      {item.children.map((child: any) => {
                        const ChildIcon = child.icon;
                        const isChildActive = pathname === child.href;
                        return (
                          <Link
                            key={child.label}
                            href={child.href}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold transition-all duration-200 group/child ${
                              isChildActive
                                ? "bg-emerald-500/30 text-white border border-emerald-500/30 shadow-sm"
                                : "text-emerald-50 hover:bg-white/10 hover:text-white border border-transparent"
                            }`}
                            style={{ color: "white" }}
                          >
                            <ChildIcon className={`h-4 w-4 ${isChildActive ? "text-emerald-300" : "text-emerald-200/70 group-hover/child:text-emerald-300"}`} />
                            <span style={{ color: "inherit" }}>{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            
            {profile && (
              <Link
                href={dashboardHref}
                onClick={() => setMobileOpen(false)}
                style={{ transitionDelay: `${navItems.length * 30}ms` }}
                className={`group relative flex items-center gap-3.5 rounded-2xl px-4 py-3.5 text-[14px] font-semibold transition-all duration-300 ${
                  mobileOpen ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
                } text-white/60 hover:bg-white/5 hover:text-white border border-transparent`}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-105 transition-all">
                  <LayoutDashboard className="h-4.5 w-4.5 flex-shrink-0" />
                </div>
                <span className="font-medium text-white/70 group-hover:text-white">
                  {isAdmin ? "Dashboard Admin" : profile.role === "pegawai" ? "Dashboard Pegawai" : profile.role === "user" ? "Dashboard Pemohon" : `Dashboard ${profile.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : ""}`}
                </span>
              </Link>
            )}
          </nav>

          {/* Access Mode Area / User Profile Card */}
          <div className={`mt-8 mb-4 transition-all duration-500 delay-150 ${
            mobileOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-5 shadow-2xl border border-white/10 backdrop-blur-xl">
              {/* Card Corner Ambient Glow */}
              <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-emerald-500/10 blur-xl" />
              
              <p className="relative z-10 text-[9px] font-black uppercase tracking-[0.25em] text-emerald-400/80 mb-4">Mode Akses Portal</p>
              
              {profile ? (
                <div className="relative z-10 flex flex-col gap-3.5">
                  <div className="flex items-center gap-3 rounded-2xl bg-white/[0.03] px-4 py-3 border border-white/5 backdrop-blur-sm">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
                      {isAdmin ? <Shield className="h-5.5 w-5.5" /> : <UserCircle2 className="h-5.5 w-5.5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] font-black uppercase tracking-wider text-emerald-400">Akun Aktif</p>
                      <p className="text-xs font-bold text-white truncate tracking-tight">{profile.email || "User Account"}</p>
                    </div>
                  </div>
                  <SignOutButton />
                </div>
              ) : (
                <div className="relative z-10 grid grid-cols-3 gap-2">
                  <Link
                    href="/login/pemohon"
                    onClick={() => setMobileOpen(false)}
                    className="group flex flex-col items-center justify-center gap-2 rounded-2xl bg-white/[0.03] p-3 transition-all duration-300 border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:shadow-lg hover:shadow-emerald-950/30 active:scale-95 text-center"
                  >
                    <UserCircle2 className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-400 group-hover:text-emerald-300 transition-all duration-300 group-hover:scale-110" />
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] text-white">Pemohon</span>
                  </Link>
                  <Link
                    href="/login/pegawai"
                    onClick={() => setMobileOpen(false)}
                    className="group flex flex-col items-center justify-center gap-2 rounded-2xl bg-white/[0.03] p-3 transition-all duration-300 border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-600/10 hover:shadow-lg hover:shadow-emerald-950/30 active:scale-95 text-center"
                  >
                    <Briefcase className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-400 group-hover:text-emerald-300 transition-all duration-300 group-hover:scale-110" />
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] text-white">Pegawai</span>
                  </Link>
                  <Link
                    href="/login/petugas"
                    onClick={() => setMobileOpen(false)}
                    className="group flex flex-col items-center justify-center gap-2 rounded-2xl bg-white/[0.03] p-3 transition-all duration-300 border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-600/10 hover:shadow-lg hover:shadow-emerald-950/30 active:scale-95 text-center"
                  >
                    <Shield className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-400 group-hover:text-emerald-300 transition-all duration-300 group-hover:scale-110" />
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] text-white">Petugas</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

        </div>
        {/* Pinned Copyright Text at the Bottom */}
        <div className={`border-t border-white/5 bg-white/[0.01] py-4 px-6 relative z-10 backdrop-blur-md transition-all duration-500 delay-300 ${
          mobileOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}>
          <p className="text-center text-[10px] font-medium text-emerald-400/40 tracking-wide">
            &copy; {new Date().getFullYear()} PTSP Kemenag Barito Utara
          </p>
        </div>
      </div>
    </div>
  );
}
