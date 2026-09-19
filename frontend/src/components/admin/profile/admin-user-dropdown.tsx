import { useState, useRef, useEffect } from "react";
import Link from "@/lib/next-compat/link";
import {
  User,
  Lock,
  LogOut,
  ChevronDown,
  Crown,
  Shield,
  UserCheck,
} from "lucide-react";
import { getRoleLabel, updateDynamicConstants } from "@/lib/constants";
import { signOutAction } from "@/lib/actions/auth/sign-out";
import { fetchAPI } from "@/lib/api";
import { ImpersonateModal } from "./impersonate-modal";

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
  const [openImpersonate, setOpenImpersonate] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const userRole = profile?.role || (isSuperAdmin ? "super_admin" : "");
  const [displayRole, setDisplayRole] = useState<string>(() => {
    return getRoleLabel(userRole, profile?.email);
  });

  useEffect(() => {
    fetchAPI<any>("/master-options")
      .then((res) => {
        if (res?.success && Array.isArray(res?.data)) {
          updateDynamicConstants(res.data);
          const match = res.data.find(
            (o: any) => o.category === "role_admin" && o.value === userRole
          );
          if (match?.label) {
            setDisplayRole(match.label);
          }
        }
      })
      .catch(() => {});
  }, [userRole, isSuperAdmin]);

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
    try {
      document.cookie = "ptsp-auth=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "ptsp-auth-access-token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {}
    try {
      await signOutAction("/login/petugas");
    } catch (e) {}
    window.location.replace("/login/petugas");
  };

  const avatarUrl = profile?.avatarUrl as string | undefined;
  const [customAvatarUploaded, setCustomAvatarUploaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCustomAvatarUploaded(localStorage.getItem("user_custom_avatar") === "true");
    }
  }, []);

  const showCustomAvatar =
    Boolean(avatarUrl) &&
    avatarUrl !== "/kemenag.svg" &&
    (profile?.email !== "baritoutara@kemenag.go.id" || customAvatarUploaded);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 rounded-xl px-3 py-2 hover:bg-slate-100 transition-colors"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-50 border border-slate-200/80 overflow-hidden shadow-2xs">
          {showCustomAvatar ? (
            <img
              src={avatarUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <img
              src="/kemenag.svg"
              alt="Logo Kemenag"
              className="h-full w-full object-contain p-1"
            />
          )}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-bold text-slate-800 leading-tight whitespace-nowrap">
            {profile?.fullName || profile?.email || "Admin"}
          </p>
          <p className="text-[10px] font-semibold text-slate-400 leading-tight">
            {displayRole}
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
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-50 border border-slate-200/80 overflow-hidden shadow-2xs">
              {showCustomAvatar ? (
                <img
                  src={avatarUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src="/kemenag.svg"
                  alt="Logo Kemenag"
                  className="h-full w-full object-contain p-1"
                />
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
                    {displayRole}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#059669]">
                    <Shield className="h-3 w-3" />
                    {displayRole}
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
                href="/masyarakat"
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
              <a
                href="/pegawai"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <User className="h-4 w-4" />
                </span>
                Dashboard Pegawai
              </a>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setOpenImpersonate(true);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors text-left"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <UserCheck className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 leading-tight">Simulasi NIP Pegawai</p>
                  <p className="text-[10px] text-slate-400 font-normal truncate">Bypass ke akun pegawai tertentu</p>
                </div>
              </button>
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

      {/* Modal Simulasi Akun Pegawai (Impersonate by NIP) */}
      <ImpersonateModal
        open={openImpersonate}
        onOpenChange={setOpenImpersonate}
      />
    </div>
  );
}
