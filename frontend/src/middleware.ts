import { defineMiddleware } from "astro:middleware";
import { runWithContext } from "@/lib/request-context";
import { updateSession } from "@/lib/supabase/middleware";
import { RedirectSignal, NotFoundSignal } from "@/lib/next-compat/navigation";
import { checkMaintenanceStatus } from "@/lib/maintenance";

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
  "/layanan", "/tentang", "/kontak", "/faq",
  "/track", "/buku-tamu", "/janji-temu", "/cek-cuti",
  "/register", "/forgot-password",
  "/berita", "/artikel",
  "/kebijakan-privasi", "/syarat-ketentuan",
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

  try {
    return await runWithContext(
      { cookies, request, url, origin: url.origin, locals },
      async () => {
        if (!isPublicPage) {
          try {
            await updateSession();
          } catch {
            // Fallback: lanjutkan tanpa session refresh jika updateSession() throw
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