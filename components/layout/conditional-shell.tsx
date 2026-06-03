"use client";

import { usePathname } from "next/navigation";
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

  if (isAdmin) {
    // For admin routes: no header, no footer, no ptsp-shell padding — just raw full-screen
    return <>{children}</>;
  }

  const isHome = pathname === "/";
  const isDashboard = pathname.startsWith("/dashboard");
  const isMaintenance = pathname === "/maintenance";
  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password");

  return (
    <>
      {!isDashboard && !isAdmin && !isMaintenance && header}
      <main
        className={`relative flex w-full flex-1 flex-col ${!isHome && !isDashboard && !isAdmin && !isMaintenance ? "pt-[72px] md:pt-[84px]" : ""}`}
      >
        {children}
        {isAuthPage && (
          <footer className="pointer-events-none absolute bottom-6 left-0 z-20 w-full px-4 text-center text-[10px] sm:text-[11px] font-medium text-white/40">
            © {new Date().getFullYear()} PTSP Kantor Kementerian Agama Kab. Barito Utara
          </footer>
        )}
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
