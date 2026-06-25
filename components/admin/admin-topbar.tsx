"use client";

import { useState } from "react";
import { Menu, X, Shield } from "lucide-react";
import { AdminUserDropdown } from "./profile/admin-user-dropdown";
import { ChangePasswordModal } from "./profile/change-password-modal";
import { EditProfileModal } from "./profile/edit-profile-modal";

export function AdminTopbar({
  mobileOpen,
  setMobileOpen,
  isSuperAdmin,
  profile,
  initials,
}: {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  isSuperAdmin: boolean;
  profile: Record<string, any>;
  initials: string;
}) {
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <>
      <header className="flex items-center gap-3 border-b border-slate-200/80 bg-white px-4 py-3 shrink-0 shadow-sm z-10">
        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex lg:hidden h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
        >
          {mobileOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </button>

        {/* Brand mark — mobile only */}
        <div className="flex lg:hidden items-center gap-2 min-w-0">
          <Shield className="h-4 w-4 text-[#059669] shrink-0" />
          <p className="text-sm font-bold text-slate-800 truncate">
            Panel Admin PTSP
          </p>
        </div>

        {/* Desktop: subtle breadcrumb label */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#059669]/10">
            <Shield className="h-3.5 w-3.5 text-[#059669]" />
          </div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            PTSP Kemenag Barito Utara
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* User dropdown */}
        <AdminUserDropdown
          profile={profile}
          isSuperAdmin={isSuperAdmin}
          initials={initials}
          onOpenPassword={() => setPasswordOpen(true)}
          onOpenProfile={() => setProfileOpen(true)}
        />
      </header>

      <EditProfileModal
        open={profileOpen}
        onOpenChange={setProfileOpen}
        profile={profile}
        isSuperAdmin={isSuperAdmin}
        initials={initials}
      />

      <ChangePasswordModal open={passwordOpen} onOpenChange={setPasswordOpen} />
    </>
  );
}
