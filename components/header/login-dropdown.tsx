import Link from "next/link";
import { ChevronDown, LogIn, UserCircle2, Shield } from "lucide-react";

interface LoginDropdownProps {
  loginOpen: boolean;
  setLoginOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  needsDarkStyle: boolean;
}

export function LoginDropdown({
  loginOpen,
  setLoginOpen,
  needsDarkStyle,
}: LoginDropdownProps) {
  return (
    <div className="relative" data-login-dropdown>
      <button
        type="button"
        onClick={() => setLoginOpen((prev) => !prev)}
        className={`group flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 ${
          needsDarkStyle
            ? "bg-gradient-to-r from-[#1f4bb7] to-[#2b67f0] text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
            : "bg-white text-[#1f4bb7] shadow-lg shadow-black/10 hover:shadow-xl hover:bg-slate-50"
        }`}
      >
        <LogIn className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
        Masuk
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-300 ${
            loginOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {/* Login dropdown */}
      <div
        className={`absolute right-0 top-[calc(100%+16px)] z-50 w-60 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-300 origin-top-right ${
          loginOpen
            ? "scale-100 opacity-100 pointer-events-auto"
            : "scale-95 opacity-0 pointer-events-none"
        }`}
      >
        <div className="p-2">
          <p className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Masuk Sebagai
          </p>
          <Link
            href="/login/pemohon"
            onClick={() => setLoginOpen(false)}
            className="group/item flex items-center gap-3 rounded-xl p-3 transition-all duration-200 hover:bg-blue-50/80"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100/50 text-[#1f4bb7] transition-colors group-hover/item:bg-blue-200/50">
              <UserCircle2 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-700 transition-colors group-hover/item:text-[#1f4bb7]">
                Pemohon
              </p>
              <p className="text-xs font-medium text-slate-400">
                Masyarakat Umum
              </p>
            </div>
          </Link>
          <Link
            href="/login/petugas"
            onClick={() => setLoginOpen(false)}
            className="group/item flex items-center gap-3 rounded-xl p-3 transition-all duration-200 hover:bg-emerald-50/80"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100/50 text-[#0f8a54] transition-colors group-hover/item:bg-emerald-200/50">
              <Shield className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-700 transition-colors group-hover/item:text-[#0f8a54]">
                Petugas
              </p>
              <p className="text-xs font-medium text-slate-400">
                Staff Kemenag
              </p>
            </div>
          </Link>
        </div>
        <div className="bg-slate-50 p-3 border-t border-slate-100">
          <Link
            href="/register"
            onClick={() => setLoginOpen(false)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-600 shadow-sm border border-slate-200 transition-all duration-200 hover:border-[#1f4bb7] hover:text-[#1f4bb7] hover:shadow-md"
          >
            Daftar Akun Baru
          </Link>
        </div>
      </div>
    </div>
  );
}
