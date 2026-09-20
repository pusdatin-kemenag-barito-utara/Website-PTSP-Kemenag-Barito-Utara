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
    <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-1">
      {isAdmin && (
        <Link
          href="/admin"
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors"
        >
          <Shield className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span className="truncate">Panel Admin</span>
        </Link>
      )}
      <Link
        href="/"
        prefetch={false}
        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
      >
        <Home className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
        <span className="truncate">Kembali ke Beranda</span>
      </Link>
      <button
        onClick={handleSignOut}
        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
      >
        <LogOut className="h-4 w-4 shrink-0 text-rose-500 dark:text-rose-400" />
        <span className="truncate">Keluar Sesi</span>
      </button>
    </div>
  );
}
