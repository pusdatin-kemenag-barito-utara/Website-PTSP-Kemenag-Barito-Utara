import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  typedRoutes: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  env: {
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://va.vercel-scripts.com https://cdnjs.cloudflare.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.google.com https://www.gstatic.com",
              "img-src 'self' data: blob: https://ruunarawpewddmxexddl.supabase.co https://*.googleusercontent.com https://www.gstatic.com https://www.google.com https://*.vercel-storage.com",
              "font-src 'self' https://fonts.gstatic.com",
              "frame-src 'self' https://www.google.com blob:",
              "connect-src 'self' https://ruunarawpewddmxexddl.supabase.co wss://ruunarawpewddmxexddl.supabase.co https://www.google.com https://www.gstatic.com https://cdnjs.cloudflare.com",
              "worker-src 'self' blob: https://cdnjs.cloudflare.com",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);
