import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const appUrl = "https://ptsp.kemenag-baritoutara.com";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/dashboard/", "/api/"],
    },
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
