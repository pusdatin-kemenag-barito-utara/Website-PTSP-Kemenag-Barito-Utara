import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ptsp.kemenag-baritoutara.com";
  
  const routes = [
    "",
    "/layanan",
    "/track",
    "/kontak",
    "/buku-tamu",
    "/janji-temu",
    "/login",
    "/register",
  ];

  return routes.map((route) => ({
    url: `${appUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly" as any,
    priority: route === "" ? 1.0 : 0.8,
  }));
}
