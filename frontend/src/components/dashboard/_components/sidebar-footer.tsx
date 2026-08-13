import Link from "@/lib/next-compat/link";
import { Home, LogOut } from "lucide-react";
import { signOutAction } from "@/lib/actions/auth/sign-out";

export function SidebarFooter() {
  const handleSignOut = async () => {
    await signOutAction();
  };

  return (
    <div className="p-3.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/50 space-y-2">
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
