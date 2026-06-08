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
        className={`group flex items-center gap-2.5 rounded-2xl px-6 py-2.5 text-[14px] font-black transition-all duration-500 hover:-translate-y-1 active:translate-y-0 ${
          needsDarkStyle
            ? "bg-gradient-to-br from-[#059669] to-[#047857] text-white shadow-[0_10px_25px_-5px_rgba(5,150,105,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(5,150,105,0.5)]"
            : "bg-white text-[#059669] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.15)] hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.2)] hover:bg-emerald-50"
        }`}
      >
        <LogIn className={`h-4.5 w-4.5 transition-transform duration-500 group-hover:rotate-12 ${loginOpen ? 'rotate-12' : ''}`} />
        <span className="tracking-wide">Masuk</span>
        <ChevronDown
          className={`h-4 w-4 transition-all duration-500 ${
            loginOpen ? "rotate-180 opacity-100" : "rotate-0 opacity-60"
          }`}
        />
      </button>

      {/* Login dropdown */}
      <div
        className={`absolute right-0 top-[calc(100%+16px)] z-50 w-64 overflow-hidden rounded-[1.5rem] border border-slate-100 bg-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] transition-all duration-500 origin-top-right backdrop-blur-xl ${
          loginOpen
            ? "scale-100 opacity-100 translate-y-0 pointer-events-auto"
            : "scale-90 opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <div className="p-2.5">
          <p className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Masuk Sebagai
          </p>
          <Link
            href="/login/pemohon"
            onClick={() => setLoginOpen(false)}
            className="group/item flex items-center gap-3.5 rounded-2xl p-3.5 transition-all duration-300 hover:bg-emerald-50"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-[#059669] transition-all duration-300 group-hover/item:bg-emerald-100 group-hover/item:scale-110">
              <UserCircle2 className="h-5.5 w-5.5" />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-700 transition-colors group-hover/item:text-[#059669]">
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
            className="group/item flex items-center gap-3.5 rounded-2xl p-3.5 transition-all duration-300 hover:bg-emerald-50"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-[#0f8a54] transition-all duration-300 group-hover/item:bg-emerald-100 group-hover/item:scale-110">
              <Shield className="h-5.5 w-5.5" />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-700 transition-colors group-hover/item:text-[#0f8a54]">
                Petugas
              </p>
              <p className="text-xs font-medium text-slate-400">
                Staff PTSP / Admin
              </p>
            </div>
          </Link>
          <Link
            href="/login/pegawai"
            onClick={() => setLoginOpen(false)}
            className="group/item flex items-center gap-3.5 rounded-2xl p-3.5 transition-all duration-300 hover:bg-emerald-50"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-[#047857] transition-all duration-300 group-hover/item:bg-emerald-100 group-hover/item:scale-110">
              <UserCircle2 className="h-5.5 w-5.5" />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-700 transition-colors group-hover/item:text-[#047857]">
                Pegawai
              </p>
              <p className="text-xs font-medium text-slate-400">
                Pegawai Kemenag
              </p>
            </div>
          </Link>
        </div>
        <div className="bg-slate-50/80 p-3.5 border-t border-slate-100">
          <Link
            href="/register"
            onClick={() => setLoginOpen(false)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-600 shadow-sm border border-slate-200 transition-all duration-300 hover:border-[#059669] hover:text-[#059669] hover:shadow-lg hover:-translate-y-0.5"
          >
            Daftar Akun Baru
          </Link>
        </div>
      </div>
    </div>
  );
}
