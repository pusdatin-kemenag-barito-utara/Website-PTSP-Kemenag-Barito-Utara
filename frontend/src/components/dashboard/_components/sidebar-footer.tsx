import Link from "@/lib/next-compat/link";
import { usePathname } from "@/lib/next-compat/navigation";
import { Home, LogOut, Shield } from "lucide-react";
import { signOutAction } from "@/lib/actions/auth/sign-out";

export function SidebarFooter({
  isAdmin = false,
  mode,
}: {
  isAdmin?: boolean;
  mode?: "admin" | "pegawai" | "user";
}) {
  const pathname = usePathname();

  // Tentukan tujuan redirect login sesuai role / konteks dashboard
  let targetLogin = "/login/masyarakat";
  if (mode === "admin" || pathname.startsWith("/admin")) {
    targetLogin = "/login/petugas";
  } else if (mode === "pegawai" || pathname.startsWith("/pegawai")) {
    targetLogin = "/login/pegawai";
  } else {
    targetLogin = "/login/masyarakat";
  }

  const handleSignOut = async () => {
    try {
      document.cookie = "ptsp-auth=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "ptsp-auth-access-token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {}
    try {
      await signOutAction(targetLogin);
    } catch (e) {}
    window.location.replace(targetLogin);
  };

  return (
    <div className="p-3.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/50 space-y-2">
      {isAdmin && (
        <Link
          href="/admin"
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 px-4 py-2.5 text-xs font-bold border border-amber-500/30 transition-all duration-200"
        >
          <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <span>Kembali ke Panel Admin</span>
        </Link>
      )}
      <Link
        href="/"
        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 px-4 py-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 border border-emerald-100 dark:border-emerald-900/40 transition-all duration-200"
      >
        <Home className="h-4 w-4" />
        <span>Kembali ke Beranda</span>
      </Link>
      <button
        onClick={handleSignOut}
        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all duration-200 active:scale-95"
      >
        <LogOut className="h-4 w-4" />
        <span>Keluar Sesi</span>
      </button>
    </div>
  );
}
