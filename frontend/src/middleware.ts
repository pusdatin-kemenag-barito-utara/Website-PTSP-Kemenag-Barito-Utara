import { defineMiddleware } from "astro:middleware";
import { runWithContext } from "@/lib/request-context";
import { updateSession } from "@/lib/supabase/middleware";
import { RedirectSignal, NotFoundSignal } from "@/lib/next-compat/navigation";
import { checkMaintenanceStatus } from "@/lib/maintenance";
import { verifyNativeJWT } from "@/lib/jwt";

function getIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "127.0.0.1"
  );
}

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");
  if (!host) return false;
  if (origin) {
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }
  if (referer) {
    try {
      return new URL(referer).host === host;
    } catch {
      return false;
    }
  }
  return true;
}

const PUBLIC_PATHS = [
  "/", "/login", "/login/masyarakat", "/login/masyarakat/lengkapi-profil", "/login/pegawai", "/login/petugas",
  "/layanan", "/layanan-pegawai", "/tentang", "/kontak", "/faq",
  "/track", "/buku-tamu", "/janji-temu", "/cek-cuti",
  "/register", "/forgot-password",
  "/berita", "/artikel",
  "/kebijakan-privasi", "/syarat-ketentuan",
  "/offline", "/offline.html",
];

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, cookies, url, locals } = context;
  const ip = getIp(request);
  const path = url.pathname;
  const method = request.method;

  // CSRF protection for state-changing requests
  if (method !== "GET" && method !== "HEAD") {
    if (!isSameOrigin(request)) {
      return new Response(
        JSON.stringify({ error: "Permintaan ditolak: origin tidak dikenal." }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
            "X-Frame-Options": "SAMEORIGIN",
            "X-Content-Type-Options": "nosniff",
          },
        },
      );
    }
  }

  const isPublicPage =
    path === "/" || PUBLIC_PATHS.some((p) => path === p || path.startsWith(p + "/"));

  const isStaticOrAsset =
    path.startsWith("/_astro") ||
    path.startsWith("/_image") ||
    path.startsWith("/@") ||
    path.startsWith("/assets") ||
    path.startsWith("/images") ||
    path.startsWith("/icons") ||
    path.includes(".") ||
    path.startsWith("/api");

  const isExemptFromMaintenance =
    path === "/maintenance" ||
    path === "/login/petugas" ||
    path.startsWith("/admin") ||
    isStaticOrAsset;

  let isMaintenanceMode = false;
  if (!isExemptFromMaintenance) {
    isMaintenanceMode = await checkMaintenanceStatus();
  }

  const isProtectedAdmin = path.startsWith("/admin");
  const isProtectedPegawai = path.startsWith("/pegawai");
  const isProtectedMasyarakat = path.startsWith("/masyarakat");

  const activeAuthToken =
    cookies.get("ptsp-auth")?.value ||
    cookies.get("ptsp-auth-access-token")?.value;
  if (activeAuthToken) {
    (globalThis as any).__ptsp_current_token = activeAuthToken;
  }

  // Jika halaman terproteksi dan sesi auth tidak ada, langsung redirect ke halaman login
  if (isProtectedAdmin || isProtectedPegawai || isProtectedMasyarakat) {
    let authCookie = cookies.get("ptsp-auth")?.value;
    if (!authCookie) {
      const cookieHeader = request.headers.get("cookie") || "";
      const match = cookieHeader.match(/ptsp-auth=([^;]+)/);
      if (match) {
        try {
          authCookie = decodeURIComponent(match[1].trim());
        } catch {
          authCookie = match[1].trim();
        }
      }
    }

    const legacyCookie = cookies.get("ptsp-auth-access-token")?.value;
    const claims = authCookie ? verifyNativeJWT(authCookie) : null;
    if (!claims && !legacyCookie) {
      if (isProtectedAdmin) {
        return context.redirect("/login/petugas", 302);
      } else if (isProtectedPegawai) {
        return context.redirect("/login/pegawai", 302);
      } else {
        return context.redirect("/login/masyarakat", 302);
      }
    }
  }

  try {
    return await runWithContext(
      { cookies, request, url, origin: url.origin, locals },
      async () => {
        if (!isPublicPage) {
          const authCookie = cookies.get("ptsp-auth")?.value;
          const isNative = authCookie ? !!verifyNativeJWT(authCookie) : false;
          if (!isNative) {
            try {
              await updateSession();
            } catch {
              // Fallback: lanjutkan tanpa session refresh jika updateSession() throw
            }
          }
        }

        if (isMaintenanceMode) {
          return context.redirect("/maintenance", 302);
        }

        const response = await next();
        response.headers.set("X-RateLimit-Limit", "60");
        response.headers.set("X-Frame-Options", "SAMEORIGIN");
        response.headers.set("X-Content-Type-Options", "nosniff");
        response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

        // Cloudflare CDN & Browser Caching untuk Aset Statis & Media
        if (isStaticOrAsset && !path.startsWith("/api")) {
          if (path.startsWith("/_astro/") || path.includes(".woff2") || path.includes(".woff")) {
            // Immutable hashed bundle / font: 1 tahun di Cloudflare Edge & Browser
            response.headers.set("Cache-Control", "public, max-age=31536000, immutable");
            response.headers.set("CDN-Cache-Control", "public, max-age=31536000");
            response.headers.set("Cloudflare-CDN-Cache-Control", "public, max-age=31536000");
          } else if (/\.(png|jpg|jpeg|webp|svg|ico|json|txt|xml|pdf)$/i.test(path)) {
            // Gambar, logo, favicon: 30 hari di Cloudflare Edge
            response.headers.set("Cache-Control", "public, max-age=2592000, stale-while-revalidate=86400");
            response.headers.set("CDN-Cache-Control", "public, max-age=2592000");
            response.headers.set("Cloudflare-CDN-Cache-Control", "public, max-age=2592000");
          }
        }

        // Anti-Back Cache Security: Jangan pernah simpan halaman terproteksi di browser cache (bfcache)
        if (isProtectedAdmin || isProtectedPegawai || isProtectedMasyarakat) {
          response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
          response.headers.set("Pragma", "no-cache");
          response.headers.set("Expires", "0");
        }

        return response;
      },
    );
  } catch (e) {
    if (e instanceof RedirectSignal) {
      return context.redirect(e.path, 302);
    }
    if (e instanceof NotFoundSignal) {
      return context.rewrite("/404");
    }
    throw e;
  }
});