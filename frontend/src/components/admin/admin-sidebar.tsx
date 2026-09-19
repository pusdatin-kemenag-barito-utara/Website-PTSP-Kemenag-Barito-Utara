import { useMemo } from "react";
import { useSearchParams } from "@/lib/next-compat/navigation";
import { ChevronRight, Shield } from "lucide-react";
import { SystemHealthBadge } from "./system-health-badge";

function NavLink({
  item,
  isActive,
  onClick,
}: {
  item: any;
  isActive: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.();
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    
    // Only prevent default navigation if user is already on the exact same page & query
    if (typeof window !== "undefined") {
      const currentFull = window.location.pathname + window.location.search;
      try {
        const targetUrl = new URL(item.href, window.location.origin);
        const targetFull = targetUrl.pathname + targetUrl.search;
        if (currentFull === targetFull) {
          e.preventDefault();
          return;
        }
      } catch {
        // fallback
      }
    }
  };

  return (
    <a
      href={item.href}
      data-astro-prefetch="hover"
      onClick={handleClick}
      className={`group relative flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-all duration-150 cursor-pointer ${
        isActive
          ? "bg-emerald-500/15 text-emerald-400 shadow-sm border border-emerald-500/30 font-semibold"
          : "text-slate-300 hover:text-white hover:bg-white/5 border border-transparent"
      }`}
    >
      {isActive && (
        <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
      )}
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-all duration-150 ${
          isActive
            ? "bg-emerald-500/20 text-emerald-400"
            : "bg-transparent text-slate-400 group-hover:text-white group-hover:bg-white/10"
        }`}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="flex-1 leading-tight truncate">{item.label}</span>
      {isActive && (
        <ChevronRight className="h-3.5 w-3.5 opacity-80 shrink-0 text-emerald-400" />
      )}
    </a>
  );
}

export function AdminSidebar({
  groups,
  authorizedNav,
  pathname,
  currentSearch,
  activeMenu,
  activeType,
  onNavClick,
}: {
  groups: string[];
  authorizedNav: any[];
  pathname: string;
  currentSearch?: string;
  activeMenu?: string;
  activeType?: "public" | "asn";
  onNavClick?: () => void;
}) {
  const hookSearchParams = useSearchParams();

  const effectiveSearchParams = useMemo(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search);
    }
    if (currentSearch) {
      return new URLSearchParams(currentSearch);
    }
    return hookSearchParams;
  }, [currentSearch, hookSearchParams]);

  return (
    <div className="flex h-full flex-col">
      {/* Logo / Brand */}
      <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-white/5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-md shadow-emerald-900/30">
          <Shield className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-extrabold text-white leading-tight truncate tracking-tight">
            PANEL ADMIN
          </p>
          <p className="text-[9.5px] font-medium text-slate-400 truncate">
            PTSP KEMENAG BARITO UTARA
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-2.5 space-y-1">
        {groups.map((group: string) => {
          const groupItems = authorizedNav.filter(
            (item: any) => (item.group || "") === group,
          );

          return (
            <div key={group} className="mb-2">
              {group && (
                <div className="flex w-full items-center gap-1.5 px-2 pt-2 pb-1 text-left text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
                  <span className="flex-1">{group}</span>
                </div>
              )}
              <div className="space-y-0.5">
                {groupItems.map((item: any) => {
                  const hrefPath = item.href.split("?")[0];
                  let isActive = false;

                  if (activeMenu) {
                    isActive = item.id === activeMenu;
                  } else if (item.href === "/admin") {
                    isActive = pathname === "/admin";
                  } else {
                    const isPengajuanRoute = pathname.startsWith("/admin/pengajuan");
                    const isDokumenRoute = pathname.startsWith("/admin/dokumen-hasil");
                    const isLayananAsnRoute = pathname.startsWith("/admin/layanan-asn");
                    const isLayananPublikRoute =
                      (pathname.startsWith("/admin/layanan") && !isLayananAsnRoute) ||
                      pathname.startsWith("/admin/item-layanan") ||
                      pathname.startsWith("/admin/persyaratan") ||
                      pathname.startsWith("/admin/form-layanan");
                    const isManajemenCutiRoute =
                      pathname.startsWith("/admin/kepegawaian/pegawai") ||
                      pathname.startsWith("/admin/manajemen-pegawai/pejabat");

                    if (item.id === "pengajuan_masyarakat" || item.id === "pengajuan_pegawai") {
                      if (isPengajuanRoute) {
                        const currentType = effectiveSearchParams.get("type") || activeType || "public";
                        isActive = (item.id === "pengajuan_pegawai" && currentType === "asn") ||
                                   (item.id === "pengajuan_masyarakat" && currentType !== "asn");
                      }
                    } else if (item.id === "dokumen_hasil_masyarakat" || item.id === "dokumen_hasil_pegawai") {
                      if (isDokumenRoute) {
                        const currentType = effectiveSearchParams.get("type") || activeType || "public";
                        isActive = (item.id === "dokumen_hasil_pegawai" && currentType === "asn") ||
                                   (item.id === "dokumen_hasil_masyarakat" && currentType !== "asn");
                      }
                    } else if (item.id === "layanan") {
                      isActive = isLayananPublikRoute;
                    } else if (item.id === "layanan_asn") {
                      isActive = isLayananAsnRoute;
                    } else if (item.id === "manajemen_pegawai") {
                      isActive = isManajemenCutiRoute;
                    } else if (item.id === "pengguna_petugas" || item.id === "pengguna_pegawai" || item.id === "pengguna_pemohon") {
                      if (pathname.startsWith("/admin/pengguna")) {
                        const currentTab = effectiveSearchParams.get("tab") || "petugas";
                        if (item.id === "pengguna_petugas") isActive = currentTab === "petugas";
                        if (item.id === "pengguna_pegawai") isActive = currentTab === "pegawai";
                        if (item.id === "pengguna_pemohon") isActive = currentTab === "pemohon";
                      }
                    } else {
                      isActive =
                        pathname === hrefPath ||
                        pathname.startsWith(`${hrefPath}/`);
                    }
                  }

                  return (
                    <NavLink
                      key={item.href}
                      item={item}
                      isActive={isActive}
                      onClick={onNavClick}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <SystemHealthBadge />
    </div>
  );
}

