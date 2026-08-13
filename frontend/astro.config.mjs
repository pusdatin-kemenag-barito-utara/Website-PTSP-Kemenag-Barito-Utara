import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import node from "@astrojs/node";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import VitePWA from "@vite-pwa/astro";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  site: "https://ptsp.kemenag-baritoutara.com",
  output: "server",
  adapter: node({ mode: "standalone" }),
  server: {
    port: 3000,
    host: "0.0.0.0",
  },
  security: {
    checkOrigin: true,
  },
  integrations: [
    react(),
    sitemap(),
    VitePWA({
      devOptions: { enabled: false },
      registerType: "autoUpdate",
      manifest: false,
      includeAssets: [
        "kemenag-192.png",
        "kemenag-512.png",
        "kemenag.svg",
        "manifest.json",
      ],
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,jpg,jpeg,webp,woff2,mjs}"],
        navigateFallback: null,
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\/api\/v1\//i,
            handler: "NetworkOnly",
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|webp|svg|gif)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "ptsp-images",
              expiration: {
                maxEntries: 120,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],
      },
    }),
  ],
  vite: {
    envDir: path.resolve(__dirname, ".."),
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        // next/* compat layer
        "next/link": path.resolve(__dirname, "./src/lib/next-compat/link.tsx"),
        "next/image": path.resolve(__dirname, "./src/lib/next-compat/image.tsx"),
        "next/navigation": path.resolve(__dirname, "./src/lib/next-compat/navigation.ts"),
        "next/cache": path.resolve(__dirname, "./src/lib/next-compat/cache.ts"),
        "next/dynamic": path.resolve(__dirname, "./src/lib/next-compat/dynamic.ts"),
        "next/font/google": path.resolve(__dirname, "./src/lib/next-compat/font-google.ts"),
        "next/server": path.resolve(__dirname, "./src/lib/next-compat/server.ts"),
        // pdfjs-dist needs canvas=false alias when rendering in browser
        canvas: path.resolve(__dirname, "./src/lib/next-compat/canvas-mock.js"),
      },
    },
    optimizeDeps: {
      include: ["react", "react-dom", "lucide-react"],
    },
  },
});