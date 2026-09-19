import Link from "@/lib/next-compat/link";
import { usePathname } from "@/lib/next-compat/navigation";
import { 
  LayoutDashboard, 
  ClipboardList, 
  Plus, 
  FolderArchive, 
  User 
} from "lucide-react";

export function BottomNavPemohon() {
  const pathname = usePathname() || "";

  const isHome = pathname === "/masyarakat" || pathname === "/masyarakat/";
  const isRiwayat = pathname === "/masyarakat/pengajuan" || (pathname.startsWith("/masyarakat/pengajuan/") && !pathname.includes("/baru"));
  const isAjukan = pathname === "/masyarakat/pengajuan/baru";
  const isArsip = pathname.startsWith("/masyarakat/arsip");
  const isProfil = pathname.startsWith("/masyarakat/profil");

  return (
    <nav
      aria-label="Navigasi Bawah Pemohon"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/90 dark:border-slate-800/90 px-1 pt-1.5 pb-[max(8px,calc(env(safe-area-inset-bottom)+6px))] shadow-[0_-4px_25px_rgba(0,0,0,0.08)] select-none"
    >
      <div className="flex flex-row items-center justify-around w-full max-w-md mx-auto relative h-14">
        {/* 1. Beranda */}
        <Link
          href="/masyarakat"
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-transform active:scale-95 ${
            isHome
              ? "text-emerald-600 dark:text-emerald-400 font-bold"
              : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-medium"
          }`}
        >
          <div className={`flex items-center justify-center h-8 w-11 rounded-full transition-all duration-200 ${isHome ? "bg-emerald-50 dark:bg-emerald-950/80" : ""}`}>
            <LayoutDashboard className={`h-5 w-5 ${isHome ? "scale-105 stroke-[2.25]" : "stroke-[1.75]"}`} />
          </div>
          <span className={`text-[10px] tracking-tight mt-0.5 truncate ${isHome ? "font-bold text-emerald-700 dark:text-emerald-300" : "font-medium"}`}>
            Beranda
          </span>
        </Link>

        {/* 2. Riwayat */}
        <Link
          href="/masyarakat/pengajuan"
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-transform active:scale-95 ${
            isRiwayat
              ? "text-emerald-600 dark:text-emerald-400 font-bold"
              : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-medium"
          }`}
        >
          <div className={`flex items-center justify-center h-8 w-11 rounded-full transition-all duration-200 ${isRiwayat ? "bg-emerald-50 dark:bg-emerald-950/80" : ""}`}>
            <ClipboardList className={`h-5 w-5 ${isRiwayat ? "scale-105 stroke-[2.25]" : "stroke-[1.75]"}`} />
          </div>
          <span className={`text-[10px] tracking-tight mt-0.5 truncate ${isRiwayat ? "font-bold text-emerald-700 dark:text-emerald-300" : "font-medium"}`}>
            Riwayat
          </span>
        </Link>

        {/* 3. Ajukan (Elevated FAB) */}
        <div className="flex-1 flex flex-col items-center justify-center relative py-1">
          <Link
            href="/masyarakat/pengajuan/baru"
            aria-label="Buat Pengajuan Baru"
            className={`absolute -top-5 h-12 w-12 rounded-full flex items-center justify-center shadow-lg shadow-emerald-600/35 transition-all duration-200 active:scale-90 border-[3.5px] border-white dark:border-slate-900 ${
              isAjukan
                ? "bg-gradient-to-tr from-emerald-600 to-teal-500 text-white ring-2 ring-emerald-500/60 scale-105"
                : "bg-gradient-to-tr from-emerald-600 to-teal-600 hover:from-emerald-500 text-white"
            }`}
          >
            <Plus className="h-6 w-6 stroke-[2.5]" />
          </Link>
          <div className="h-8 w-11" />
          <span className={`text-[10px] tracking-tight mt-0.5 truncate ${isAjukan ? "font-bold text-emerald-700 dark:text-emerald-300" : "font-semibold text-slate-600 dark:text-slate-400"}`}>
            Ajukan
          </span>
        </div>

        {/* 4. Arsip */}
        <Link
          href="/masyarakat/arsip"
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-transform active:scale-95 ${
            isArsip
              ? "text-emerald-600 dark:text-emerald-400 font-bold"
              : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-medium"
          }`}
        >
          <div className={`flex items-center justify-center h-8 w-11 rounded-full transition-all duration-200 ${isArsip ? "bg-emerald-50 dark:bg-emerald-950/80" : ""}`}>
            <FolderArchive className={`h-5 w-5 ${isArsip ? "scale-105 stroke-[2.25]" : "stroke-[1.75]"}`} />
          </div>
          <span className={`text-[10px] tracking-tight mt-0.5 truncate ${isArsip ? "font-bold text-emerald-700 dark:text-emerald-300" : "font-medium"}`}>
            Arsip
          </span>
        </Link>

        {/* 5. Profil */}
        <Link
          href="/masyarakat/profil"
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-transform active:scale-95 ${
            isProfil
              ? "text-emerald-600 dark:text-emerald-400 font-bold"
              : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-medium"
          }`}
        >
          <div className={`flex items-center justify-center h-8 w-11 rounded-full transition-all duration-200 ${isProfil ? "bg-emerald-50 dark:bg-emerald-950/80" : ""}`}>
            <User className={`h-5 w-5 ${isProfil ? "scale-105 stroke-[2.25]" : "stroke-[1.75]"}`} />
          </div>
          <span className={`text-[10px] tracking-tight mt-0.5 truncate ${isProfil ? "font-bold text-emerald-700 dark:text-emerald-300" : "font-medium"}`}>
            Profil
          </span>
        </Link>
      </div>
    </nav>
  );
}
