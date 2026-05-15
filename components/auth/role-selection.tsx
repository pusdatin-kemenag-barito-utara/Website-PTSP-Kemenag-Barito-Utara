import { m } from "framer-motion";
import { UserCircle2, ShieldCheck, ChevronRight } from "lucide-react";

type Role = "user" | "admin" | null;

export function RoleSelection({ setRole }: { setRole: (role: Role) => void }) {
  return (
    <m.div
      key="role-selection"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Reset Password
        </h1>
        <p className="text-slate-500">
          Pilih jenis akun Anda untuk melanjutkan proses reset password.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Option Pemohon */}
        <button
          onClick={() => setRole("user")}
          className="group relative flex flex-col items-center p-6 bg-white rounded-3xl border-2 border-slate-100 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 text-center"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
            <UserCircle2 className="h-8 w-8" />
          </div>
          <h3 className="font-black text-slate-800">Pemohon</h3>
          <p className="mt-1 text-[11px] text-slate-400 uppercase font-bold tracking-wider">
            Masyarakat Umum
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
            Pilih <ChevronRight className="h-3 w-3" />
          </div>
        </button>

        {/* Option Petugas */}
        <button
          onClick={() => setRole("admin")}
          className="group relative flex flex-col items-center p-6 bg-white rounded-3xl border-2 border-slate-100 hover:border-[#059669] hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 text-center"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-[#059669] group-hover:scale-110 group-hover:bg-[#059669] group-hover:text-white transition-all duration-300">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h3 className="font-black text-slate-800">Petugas</h3>
          <p className="mt-1 text-[11px] text-slate-400 uppercase font-bold tracking-wider">
            Internal Kemenag
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-[#059669] opacity-0 group-hover:opacity-100 transition-opacity">
            Pilih <ChevronRight className="h-3 w-3" />
          </div>
        </button>
      </div>
    </m.div>
  );
}
