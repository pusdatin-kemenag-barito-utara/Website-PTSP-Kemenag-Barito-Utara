"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  X, 
  Search,
  ChevronDown,
  Shield,
  UserCircle2,
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
  needsDarkStyle, // this might not be used now that the drawer is fully white
  pathname,
  navItems,
  profile,
  dashboardHref,
  isAdmin,
}: MobileNavProps) {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const toggleExpand = (label: string) => {
    setExpandedItems(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] lg:hidden transition-all duration-300 ease-in-out ${
        mobileOpen ? "visible" : "invisible pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${
          mobileOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Drawer: Slide dari kanan */}
      <div
        className={`absolute top-0 right-0 bottom-0 w-[300px] max-w-[85vw] flex flex-col bg-white shadow-2xl transition-transform duration-300 cubic-bezier(0.16, 1, 0.3, 1) ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Image 
              src="/atak-portal.png" 
              alt="Logo Kemenag" 
              width={40} 
              height={40} 
              className="w-10 h-10 object-contain" 
              unoptimized 
            />
            <p className="text-base font-black uppercase tracking-wide text-emerald-800 leading-tight flex items-center gap-1">
              PTSP Si{" "}
              <Image src="/atak.png" alt="ATAK" width={60} height={24} className="h-[1em] w-auto object-contain inline-block" style={{ height: "1em", width: "auto" }} unoptimized />
            </p>
          </div>
          <button 
            onClick={() => setMobileOpen(false)} 
            className="h-9 w-9 inline-flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-2">


          {/* Search Box (Dummy UI to match Kemenag Barito Utara) */}
          <div className="px-6 py-3">
            <div className="flex items-center gap-2.5 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100 focus-within:ring-emerald-500/50 focus-within:bg-white transition-all">
              <Search className="h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari Informasi..." 
                className="bg-transparent text-sm w-full outline-none text-slate-700 placeholder:text-slate-400" 
              />
            </div>
          </div>

          {/* Links */}
          <nav className="px-6 py-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">Navigasi Utama</p>
            <ul className="space-y-1">
              {navItems.map((item) => {
                const hasChildren = item.children && item.children.length > 0;
                const isExpanded = expandedItems[item.label];
                const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

                return (
                  <li key={item.label} className="block">
                    <div
                      className={`flex items-center justify-between rounded-2xl transition-all duration-200 ${
                        isExpanded ? "bg-slate-50 ring-1 ring-slate-100" : ""
                      }`}
                    >
                      {hasChildren ? (
                        <div
                          onClick={() => toggleExpand(item.label)}
                          className={`flex-1 cursor-pointer px-4 py-3.5 text-[13px] font-bold transition-colors ${
                            active || isExpanded ? "text-emerald-700" : "text-slate-600"
                          }`}
                        >
                          {item.label}
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={`flex-1 px-4 py-3.5 text-[13px] font-bold transition-colors block ${
                            active ? "text-emerald-700" : "text-slate-600"
                          }`}
                        >
                          {item.label}
                        </Link>
                      )}

                      {hasChildren && (
                        <button
                          onClick={() => toggleExpand(item.label)}
                          className={`group flex items-center justify-center w-12 self-stretch border-l border-transparent transition-all ${
                            isExpanded ? "border-slate-200" : ""
                          }`}
                        >
                          <div className={`flex h-7 w-7 items-center justify-center rounded-full transition-all group-active:scale-90 ${
                            isExpanded ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
                          }`}>
                            <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                          </div>
                        </button>
                      )}
                    </div>

                    {hasChildren && isExpanded && (
                      <ul className="mt-1 ml-4 space-y-1 border-l-2 border-slate-100 py-1 pl-4">
                        {item.children.map((child: any) => (
                          <li key={child.href}>
                            <Link
                              href={child.href} 
                              onClick={() => setMobileOpen(false)}
                              className={`block rounded-xl px-4 py-3 text-[12px] font-bold transition-colors ${
                                pathname === child.href 
                                  ? "bg-emerald-50 text-emerald-700" 
                                  : "text-slate-500 hover:text-slate-900"
                              }`}
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

        </div>

        {/* Footer Utilities */}
        <div className="flex-shrink-0 border-t border-slate-100 p-6 flex flex-col gap-6 bg-white">
          {/* Login / Auth */}
          {profile ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 border border-slate-100">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  {isAdmin ? <Shield className="h-5 w-5" /> : <UserCircle2 className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">AKUN AKTIF</p>
                  <p className="text-xs font-bold text-slate-700 truncate">{profile.email || "User Account"}</p>
                </div>
              </div>
              <Link
                href={dashboardHref}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center w-full gap-2 rounded-full bg-emerald-600 px-6 py-3 text-[12px] font-black uppercase tracking-[0.1em] text-white transition-all hover:bg-emerald-700"
              >
                DASHBOARD
              </Link>
              <SignOutButton />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                href="/login/pemohon"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center w-full gap-2 rounded-full bg-emerald-600 px-6 py-3 text-[12px] font-black uppercase tracking-[0.1em] text-white transition-all hover:bg-emerald-700 shadow-[0_8px_20px_-6px_rgba(16,185,129,0.5)]"
              >
                MASUK PEMOHON
              </Link>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login/pegawai"
                  onClick={() => setMobileOpen(false)}
                  className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-slate-50 p-3 transition-all duration-300 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 text-center"
                >
                  <Briefcase className="h-5 w-5 text-emerald-600" />
                  <span className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-600">PEGAWAI</span>
                </Link>
                <Link
                  href="/login/petugas"
                  onClick={() => setMobileOpen(false)}
                  className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-slate-50 p-3 transition-all duration-300 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 text-center"
                >
                  <Shield className="h-5 w-5 text-emerald-600" />
                  <span className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-600">PETUGAS</span>
                </Link>
              </div>
            </div>
          )}

          {/* HAPAKAT Section di Footer */}
          <div className="flex flex-col items-center justify-center gap-2 pt-4 border-t border-slate-100 text-center">
            <Image 
              src="/icons/hapakat.png" 
              alt="HAPAKAT" 
              width={112} 
              height={32} 
              className="w-28 h-auto object-contain"
              unoptimized
            />
            <p className="text-[9px] font-bold leading-relaxed text-center">
              <span className="text-amber-500">H</span><span className="text-emerald-600">armonis, </span>
              <span className="text-amber-500">A</span><span className="text-emerald-600">manah, </span>
              <span className="text-amber-500">P</span><span className="text-emerald-600">rofesional, </span>
              <span className="text-amber-500">A</span><span className="text-emerald-600">kuntabel, </span>
              <span className="text-amber-500">K</span><span className="text-emerald-600">reatif, </span>
              <span className="text-amber-500">A</span><span className="text-emerald-600">dil dan </span>
              <span className="text-amber-500">T</span><span className="text-emerald-600">ransparan</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
