import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

import path from "path";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  output: "standalone",
  typedRoutes: false,
  // @ts-ignore
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 82, 95],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  env: {
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
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
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://va.vercel-scripts.com https://cdnjs.cloudflare.com https://challenges.cloudflare.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.google.com https://www.gstatic.com",
              "img-src 'self' data: blob: https://*.supabase.co https://*.sslip.io:8000 http://*.sslip.io:8000 https://*.sslip.io http://*.sslip.io https://*.kemenag-baritoutara.com https://*.googleusercontent.com https://www.gstatic.com https://www.google.com https://*.vercel-storage.com https://i.ytimg.com https://img.youtube.com",
              "font-src 'self' https://fonts.gstatic.com",
              "frame-src 'self' https://www.google.com https://challenges.cloudflare.com https://www.youtube.com https://youtube.com blob:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.sslip.io:8000 http://*.sslip.io:8000 wss://*.sslip.io:8000 ws://*.sslip.io:8000 https://*.sslip.io http://*.sslip.io wss://*.sslip.io ws://*.sslip.io https://*.kemenag-baritoutara.com wss://*.kemenag-baritoutara.com https://www.google.com https://www.gstatic.com https://cdnjs.cloudflare.com https://challenges.cloudflare.com",
              "worker-src 'self' blob: https://cdnjs.cloudflare.com",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);
