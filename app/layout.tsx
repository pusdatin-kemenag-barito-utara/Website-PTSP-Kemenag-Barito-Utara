import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/header";
import { SiteFooter } from "@/components/layout/footer";
import { ConditionalShell } from "@/components/layout/conditional-shell";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import { ChatWidget } from "@/components/features/chat/ChatWidget";
import { FramerWrapper } from "@/components/layout/framer-wrapper";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-inter",
});
export const metadata: Metadata = {
  metadataBase: new URL("https://ptsp.kemenag-baritoutara.com"),
  title: {
    default: "Pelayanan Terpadu Satu Pintu (PTSP) - Kemenag Barito Utara",
    template: "%s | PTSP Kemenag Barito Utara",
  },
  applicationName: "PTSP Kemenag Barito Utara",
  description:
    "Portal resmi layanan administrasi keagamaan (PTSP) Kantor Kementerian Agama Kabupaten Barito Utara. Proses mudah, transparan, dan akuntabel.",
  keywords: [
    "Kemenag Barito Utara",
    "PTSP Kemenag",
    "Layanan Agama Barut",
    "Pelayanan Satu Pintu",
    "Muara Teweh",
    "Administrasi Keagamaan",
  ],
  authors: [{ name: "Kemenag Barito Utara" }],
  creator: "Kemenag Barito Utara",
  publisher: "Kemenag Barito Utara",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PTSP Kemenag Barito Utara",
  },
  formatDetection: {
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "PTSP Kemenag Barito Utara",
    title: "Pelayanan Terpadu Satu Pintu (PTSP) - Kemenag Barito Utara",
    description: "Portal resmi layanan administrasi keagamaan (PTSP) Kantor Kementerian Agama Kabupaten Barito Utara.",
    url: "https://ptsp.kemenag-baritoutara.com",
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: "PTSP Kemenag Barito Utara",
    description: "Portal resmi layanan administrasi keagamaan Kantor Kementerian Agama Kabupaten Barito Utara.",
    creator: "@kemenag_barut",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/kemenag.svg", type: "image/svg+xml" },
      { url: "/kemenag-192.png", sizes: "192x192", type: "image/png" },
      { url: "/kemenag-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/kemenag-192.png",
    apple: "/kemenag-512.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "PTSP Kemenag Barito Utara",
      "alternateName": ["PTSP Barut", "Kemenag Barito Utara"],
      "url": "https://ptsp.kemenag-baritoutara.com",
    },
    {
      "@context": "https://schema.org",
      "@type": "GovernmentOrganization",
      "name": "Kantor Kementerian Agama Kabupaten Barito Utara",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Jl. A. Yani No. 6",
        "addressLocality": "Muara Teweh",
        "addressRegion": "Kalimantan Tengah",
        "addressCountry": "ID"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+6251921xxx",
        "contactType": "customer service"
      },
      "logo": "https://ptsp.kemenag-baritoutara.com/kemenag-512.png"
    }
  ];

  return (
    <html lang="id" className={`${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="text-slate-900 antialiased">
        <FramerWrapper>
          <div className="flex min-h-dvh flex-col">
            <ConditionalShell header={<SiteHeader />} footer={<SiteFooter />}>
              {children}
              <Analytics />
            </ConditionalShell>
            <Toaster 
              position="top-center" 
              richColors
              toastOptions={{
                style: {
                  borderRadius: '14px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  padding: '16px',
                  fontWeight: '500'
                },
                className: "text-[14px]"
              }}
            />
            <ChatWidget />
          </div>
        </FramerWrapper>
      </body>
    </html>
  );
}
