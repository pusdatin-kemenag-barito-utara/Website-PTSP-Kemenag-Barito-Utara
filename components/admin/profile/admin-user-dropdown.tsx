"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Lock,
  LogOut,
  ChevronDown,
  Crown,
  Shield,
} from "lucide-react";
import { getRoleLabel } from "@/lib/constants";
import { signOutAction } from "@/lib/actions/auth/sign-out";

interface AdminUserDropdownProps {
  profile: Record<string, any>;
  isSuperAdmin: boolean;
  initials: string;
  onOpenPassword: () => void;
  onOpenProfile: () => void;
}

export function AdminUserDropdown({
  profile,
  isSuperAdmin,
  initials,
  onOpenPassword,
  onOpenProfile,
}: AdminUserDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOutAction();
  };

  const avatarUrl = profile?.avatarUrl as string | undefined;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 rounded-xl px-3 py-2 hover:bg-slate-100 transition-colors"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 border border-emerald-200/50 overflow-hidden">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-[10px] font-black text-[#059669]">
              {initials}
            </span>
          )}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-bold text-slate-800 leading-tight whitespace-nowrap">
            {profile?.fullName || profile?.email || "Admin"}
          </p>
          <p className="text-[10px] font-semibold text-slate-400 leading-tight">
            {getRoleLabel(profile?.role, profile?.email)}
          </p>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/5 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
          {/* User info card */}
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3 mb-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 border border-emerald-200/50 overflow-hidden">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs font-black text-[#059669]">
                  {initials}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-800 whitespace-nowrap overflow-visible">
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
                    {getRoleLabel(profile?.role, profile?.email)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 my-1" />

          {/* Menu items */}
          {isSuperAdmin && (
            <>
              <a
                href="/api/admin/bypass-login?target=/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <User className="h-4 w-4" />
                </span>
                Dashboard Pemohon
              </a>
              <div className="h-px bg-slate-100 my-1" />
            </>
          )}

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onOpenProfile();
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
              <User className="h-4 w-4" />
            </span>
            Update Profil
          </button>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onOpenPassword();
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
              <Lock className="h-4 w-4" />
            </span>
            Ubah Password
          </button>

          <div className="h-px bg-slate-100 my-1" />

          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
              <LogOut className="h-4 w-4" />
            </span>
            Keluar Sesi
          </button>
        </div>
      )}
    </div>
  );
}
