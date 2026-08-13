import type { APIRoute } from "astro";

const appUrl = "https://ptsp.kemenag-baritoutara.com";

const routes = [
  { path: "", frequency: "daily", priority: 1.0 },
  { path: "/layanan", frequency: "weekly", priority: 0.8 },
  { path: "/track", frequency: "weekly", priority: 0.8 },
  { path: "/kontak", frequency: "weekly", priority: 0.8 },
  { path: "/buku-tamu", frequency: "weekly", priority: 0.8 },
  { path: "/janji-temu", frequency: "weekly", priority: 0.8 },
  { path: "/login", frequency: "weekly", priority: 0.8 },
  { path: "/register", frequency: "weekly", priority: 0.8 },
];

export const GET: APIRoute = () => {
  const lastModified = new Date().toISOString();
  const urls = routes
    .map(
      (r) => `  <url>
    <loc>${appUrl}${r.path}</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>${r.frequency}</changefreq>
    <priority>${r.priority}</priority>
  </url>`,
    )
    .join("\n");

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(sitemapXml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};