import { Shield, Crown, Users, BadgeCheck } from "lucide-react";
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
  if (role.startsWith("admin_")) {
    const formattedRole = role
      .replace("admin_", "")
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <Shield className="h-3 w-3 shrink-0" />
        <span className="truncate max-w-[200px]">Admin {formattedRole === "Ptsp" ? "PTSP" : formattedRole}</span>
      </span>
    );
  }
  if (role === "kasubag_tu") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
        <Shield className="h-3 w-3 shrink-0" />
        Kasubag TU
      </span>
    );
  }
  if (role === "kepala_kantor") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <Crown className="h-3 w-3 shrink-0" />
        Kepala Kantor
      </span>
    );
  }
  if (role === "pegawai") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
        <BadgeCheck className="h-3 w-3 shrink-0" />
        Pegawai
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold bg-slate-50 text-slate-600 border border-slate-200">
      <Users className="h-3 w-3 shrink-0" />
      Pemohon
    </span>
  );
}
