import { Shield, Crown, Users } from "lucide-react";
import { isSuperAdmin } from "@/lib/constants";

export function RoleBadge({ role, email }: { role: string; email?: string }) {
  const isSuper = isSuperAdmin(email);
  if (isSuper) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border border-amber-200 shadow-sm shadow-amber-100">
        <Crown className="h-3 w-3" />
        Super Admin
      </span>
    );
  }
  if (role === "admin_ptsp") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
        <Shield className="h-3 w-3" />
        Admin PTSP
      </span>
    );
  }
  if (role === "kasubag_tu") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
        <Shield className="h-3 w-3" />
        Kasubag TU
      </span>
    );
  }
  if (role === "kepala_kantor") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <Crown className="h-3 w-3" />
        Kepala Kantor
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold bg-slate-50 text-slate-600 border border-slate-200">
      <Users className="h-3 w-3" />
      Pemohon
    </span>
  );
}
