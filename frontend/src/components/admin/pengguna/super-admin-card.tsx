import { Crown, Shield } from "lucide-react";
import { formatDate } from "@/lib/utils";

export function SuperAdminCard({ superAdmin }: { superAdmin: any }) {
  if (!superAdmin) return null;

  return (
    <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50/50 to-yellow-50/30 shadow-sm overflow-hidden">
      <div className="border-b border-amber-100 px-5 py-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
          <Crown className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-sm font-black text-amber-800">Super Admin</h3>
          <p className="text-[11px] text-amber-600/70 mt-0.5">
            Pemilik sistem dengan hak akses tertinggi. Tidak dapat diubah.
          </p>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 text-white font-black text-base shadow-sm shadow-amber-200">
            {(superAdmin.fullName || superAdmin.email || "S")
              .charAt(0)
              .toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-black text-slate-900">
              {superAdmin.fullName || "Super Admin"}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{superAdmin.email}</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Terdaftar
            </p>
            <p className="text-xs text-slate-600 mt-0.5">
              {formatDate(superAdmin.createdAt)}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border border-amber-200 shadow-sm">
            <Crown className="h-3.5 w-3.5" />
            Super Admin
          </span>
        </div>
      </div>
    </div>
  );
}
