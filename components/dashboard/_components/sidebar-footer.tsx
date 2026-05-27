import Link from "next/link";
import { Home, LogOut } from "lucide-react";
import { signOutAction } from "@/lib/actions/auth/sign-out";

export function SidebarFooter() {
  const handleSignOut = async () => {
    await signOutAction();
  };

  return (
    <div className="p-2 border-t border-slate-100 bg-slate-50/50">
      <Link
        href="/"
        className="group flex items-center gap-2.5 rounded-xl px-3 py-2 text-[12px] font-bold text-slate-500 hover:bg-white hover:text-emerald-600 transition-all duration-200"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white shadow-sm group-hover:bg-emerald-50 transition-colors">
          <Home className="h-3.5 w-3.5" />
        </div>
        Kembali ke Beranda
      </Link>
      <button
        onClick={handleSignOut}
        className="group mt-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[12px] font-bold text-rose-500 hover:bg-rose-50 transition-all duration-200"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white shadow-sm group-hover:bg-rose-100 transition-colors">
          <LogOut className="h-3.5 w-3.5" />
        </div>
        Keluar Sesi
      </button>
    </div>
  );
}
