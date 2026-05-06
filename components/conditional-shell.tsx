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
  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password");

  return (
    <>
      {header}
      <main
        className={`relative flex w-full flex-1 flex-col ${!isHome ? "pt-[76px] md:pt-[84px]" : ""}`}
      >
        {children}
        {isAuthPage && (
          <footer className="pointer-events-none absolute bottom-6 left-0 z-20 w-full px-4 text-center text-[12px] font-medium text-white/80">
            © {new Date().getFullYear()} PTSP Kantor Kementerian Agama Kab.
            Barito Utara
          </footer>
        )}
      </main>
      {!isDashboard && !isAuthPage && footer}
      {isDashboard && (
        <footer className="border-t border-slate-200 bg-white py-4 text-center text-[11px] font-medium text-slate-400">
          © {new Date().getFullYear()} PTSP Kantor Kementerian Agama Kab. Barito
          Utara
        </footer>
      )}
    </>
  );
}
