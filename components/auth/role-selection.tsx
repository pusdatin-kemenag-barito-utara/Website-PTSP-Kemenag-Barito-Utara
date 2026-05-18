import { m } from "framer-motion";
import { UserCircle2, ShieldCheck, ChevronRight, KeyRound, ArrowLeft } from "lucide-react";
import Link from "next/link";

type Role = "user" | "admin" | null;

export function RoleSelection({ setRole }: { setRole: (role: Role) => void }) {
  return (
    <m.div
      key="role-selection"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="overflow-hidden rounded-[2.5rem] bg-white/95 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.5)] backdrop-blur-xl ring-1 ring-white/20"
    >
      {/* Header Area */}
      <div className="relative bg-gradient-to-b from-slate-50/80 to-white px-8 pt-12 pb-6 text-center">
        {/* Decoration */}
        <div className="absolute left-0 top-0 h-2 w-full bg-gradient-to-r from-[#0f8a54] via-[#14b870] to-[#0f8a54]" />

        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-[#0f8a54] shadow-xl shadow-emerald-500/10 ring-1 ring-slate-100 transition-transform hover:scale-110 duration-500">
          <KeyRound className="h-10 w-10 text-[#0f8a54]" />
        </div>

        <p className="mb-2 text-[11px] font-black uppercase tracking-[0.3em] text-[#0f8a54]">
          Portal Keamanan
        </p>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 drop-shadow-sm">
          Reset Password
        </h1>
        <p className="mt-3 text-sm font-medium text-slate-500 leading-relaxed px-2">
          Pilih jenis akun Anda untuk melanjutkan proses pemulihan password.
        </p>
      </div>

      {/* Grid Options Area */}
      <div className="px-8 pb-8 pt-2">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Option Pemohon */}
          <button
            onClick={() => setRole("user")}
            className="group relative flex flex-col items-center p-6 bg-white rounded-3xl border-2 border-slate-100 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 text-center"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
              <UserCircle2 className="h-8 w-8" />
            </div>
            <h3 className="font-black text-slate-800 transition-colors group-hover:text-emerald-600">Pemohon</h3>
            <p className="mt-1 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              Masyarakat Umum
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
              Pilih <ChevronRight className="h-3 w-3" />
            </div>
          </button>

          {/* Option Petugas */}
          <button
            onClick={() => setRole("admin")}
            className="group relative flex flex-col items-center p-6 bg-white rounded-3xl border-2 border-slate-100 hover:border-[#0f8a54] hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 text-center"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-[#0f8a54] group-hover:scale-110 group-hover:bg-[#0f8a54] group-hover:text-white transition-all duration-300">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h3 className="font-black text-slate-800 transition-colors group-hover:text-[#0f8a54]">Petugas</h3>
            <p className="mt-1 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              Internal Kemenag
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-[#0f8a54] opacity-0 group-hover:opacity-100 transition-opacity">
              Pilih <ChevronRight className="h-3 w-3" />
            </div>
          </button>
        </div>
      </div>

      {/* Footer Links */}
      <div className="bg-slate-50/50 px-8 py-6 text-center border-t border-slate-50">
        <div className="flex items-center justify-center text-xs font-bold uppercase tracking-wider text-slate-400">
          <Link
            href="/login/petugas"
            className="flex items-center gap-2 hover:text-[#0f8a54] transition-all hover:-translate-x-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Kembali Ke Login
          </Link>
        </div>
      </div>
    </m.div>
  );
}
