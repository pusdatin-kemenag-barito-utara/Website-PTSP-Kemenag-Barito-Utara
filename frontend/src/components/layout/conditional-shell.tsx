import { usePathname } from "@/lib/next-compat/navigation";
import type { ReactNode } from "react";

export function ConditionalShell({
  children,
  header,
  footer,
}: {
  children: ReactNode;
  header: ReactNode;
  footer: ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  const isLengkapiProfil = pathname.startsWith("/lengkapi-profil");
  const isLengkapiWaPegawai = pathname.startsWith("/lengkapi-wa-pegawai");
  const isBarcode = pathname === "/barcode" || pathname.endsWith("/barcode");

  if (isAdmin || isLengkapiProfil || isLengkapiWaPegawai || isBarcode) {
    // For admin routes & lengkapi-profil & lengkapi-wa-pegawai & barcode: no header, no footer, no ptsp-shell padding
    return <>{children}</>;
  }

  const isHome = pathname === "/";
  const isDashboard =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/pegawai") ||
    pathname.startsWith("/masyarakat");
  const isMaintenance = pathname === "/maintenance";
  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password");

  return (
    <>
      {!isDashboard && !isAdmin && !isMaintenance && !isAuthPage && header}
      <main
        className="relative flex w-full flex-1 flex-col"
      >
        {children}
      </main>
      {!isDashboard && !isAuthPage && !isMaintenance && footer}
      {isDashboard && (
        <footer className="border-t border-slate-200 bg-white py-4 text-center text-[11px] font-medium text-slate-400">
          © {new Date().getFullYear()} PTSP Kantor Kementerian Agama Kab. Barito
          Utara
        </footer>
      )}
    </>
  );
}
