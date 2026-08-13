import type { APIRoute } from "astro";

const robotsTxt = `User-Agent: *
Allow: /
Disallow: /admin/
Disallow: /dashboard/
Disallow: /api/

Sitemap: https://ptsp.kemenag-baritoutara.com/sitemap.xml`;

export const GET: APIRoute = () => {
  return new Response(robotsTxt, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};