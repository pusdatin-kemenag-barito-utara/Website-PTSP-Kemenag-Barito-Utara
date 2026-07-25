import Link from "next/link";
import { ChevronDown, LogIn, User2, Briefcase, ShieldCheck, ArrowRight } from "lucide-react";

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
        className={`group flex items-center gap-2.5 rounded-2xl px-6 py-2.5 text-[14px] font-black transition-all duration-500 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer ${
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
        className={`absolute right-0 top-[calc(100%+12px)] z-50 w-72 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 dark:bg-slate-900/95 shadow-2xl shadow-slate-900/20 transition-all duration-300 origin-top-right backdrop-blur-xl ${
          loginOpen
            ? "scale-100 opacity-100 translate-y-0 pointer-events-auto"
            : "scale-95 opacity-0 -translate-y-3 pointer-events-none"
        }`}
      >
        <div className="p-3 space-y-1.5">
          <div className="px-3 py-1.5 flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
              MASUK SEBAGAI
            </p>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <Link
            href="/login/masyarakat"
            onClick={() => setLoginOpen(false)}
            className="group/item flex items-center gap-3.5 rounded-2xl p-3 transition-all duration-300 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40 border border-transparent hover:border-emerald-200/60 dark:hover:border-emerald-800/50"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-[#059669] dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 transition-all duration-300 group-hover/item:scale-110 group-hover/item:bg-emerald-600 group-hover/item:text-white shadow-xs">
              <User2 className="h-5 w-5" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100 transition-colors group-hover/item:text-emerald-700 dark:group-hover/item:text-emerald-400">
                  Pemohon
                </p>
                <ArrowRight className="h-3.5 w-3.5 text-slate-300 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all" />
              </div>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 truncate">
                Masyarakat Umum
              </p>
            </div>
          </Link>

          <Link
            href="/login/pegawai"
            onClick={() => setLoginOpen(false)}
            className="group/item flex items-center gap-3.5 rounded-2xl p-3 transition-all duration-300 hover:bg-teal-50/80 dark:hover:bg-teal-950/40 border border-transparent hover:border-teal-200/60 dark:hover:border-teal-800/50"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-900/50 transition-all duration-300 group-hover/item:scale-110 group-hover/item:bg-teal-600 group-hover/item:text-white shadow-xs">
              <Briefcase className="h-5 w-5" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100 transition-colors group-hover/item:text-teal-700 dark:group-hover/item:text-teal-400">
                  Pegawai
                </p>
                <ArrowRight className="h-3.5 w-3.5 text-slate-300 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all" />
              </div>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 truncate">
                Pegawai Kemenag
              </p>
            </div>
          </Link>

          <Link
            href="/login/petugas"
            onClick={() => setLoginOpen(false)}
            className="group/item flex items-center gap-3.5 rounded-2xl p-3 transition-all duration-300 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40 border border-transparent hover:border-emerald-200/60 dark:hover:border-emerald-800/50"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-[#0f8a54] dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 transition-all duration-300 group-hover/item:scale-110 group-hover/item:bg-emerald-600 group-hover/item:text-white shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100 transition-colors group-hover/item:text-emerald-700 dark:group-hover/item:text-emerald-400">
                  Petugas
                </p>
                <ArrowRight className="h-3.5 w-3.5 text-slate-300 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all" />
              </div>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 truncate">
                Staff PTSP / Admin
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
