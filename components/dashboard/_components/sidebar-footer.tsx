import Link from "next/link";
import { Home, LogOut } from "lucide-react";
import { signOutAction } from "@/lib/actions/auth/sign-out";

export function SidebarFooter() {
  const handleSignOut = async () => {
    await signOutAction();
  };

  return (
    <div className="p-4 border-t border-slate-100 bg-white/50 space-y-2">
      <Link
        href="/"
        className="group flex w-full items-center justify-center gap-2.5 rounded-xl bg-emerald-50 px-4 py-2.5 text-[13px] font-bold text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 transition-all duration-200"
      >
        <Home className="h-4 w-4" />
        Kembali ke Beranda
      </Link>
      <button
        onClick={handleSignOut}
        className="group flex w-full items-center justify-center gap-2.5 rounded-xl bg-rose-500 px-4 py-2.5 text-[13px] font-bold text-white shadow-sm hover:bg-rose-600 hover:shadow transition-all duration-200"
      >
        <LogOut className="h-4 w-4" />
        Keluar Sesi
      </button>
    </div>
  );
}
