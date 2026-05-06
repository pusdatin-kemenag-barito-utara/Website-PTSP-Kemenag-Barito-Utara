import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ConditionalShell } from "@/components/conditional-shell";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Pelayanan Terpadu Satu Pintu (PTSP) - Kemenag Barito Utara",
  description:
    "Portal resmi layanan administrasi keagamaan Kantor Kementerian Agama Kabupaten Barito Utara.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PTSP Kemenag",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/kemenag.svg",
    shortcut: "/kemenag.svg",
    apple: "/kemenag.svg",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="text-slate-900 antialiased">
        <div className="flex min-h-dvh flex-col">
          <ConditionalShell header={<SiteHeader />} footer={<SiteFooter />}>
            {children}
            <Analytics />
          </ConditionalShell>
          <Toaster position="top-center" richColors />
        </div>
      </body>
    </html>
  );
}
