import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limiter";

function getIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "127.0.0.1"
  );
}

function isSameOrigin(request: NextRequest): boolean {
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

async function checkMaintenanceStatus(): Promise<boolean> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/system_status?id=eq.maintenance&select=maintenance_mode`,
      {
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
        },
        cache: "no-store", // Jangan di-cache agar perubahan instan
      }
    );
    const data = await response.json();
    return data?.[0]?.maintenance_mode === true;
  } catch (error) {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const ip = getIp(request);
  const path = request.nextUrl.pathname;
  const method = request.method;

  // CSRF protection for state-changing requests on non-Server-Action routes
  if (method !== "GET" && method !== "HEAD" && !request.headers.has("next-action")) {
    if (!isSameOrigin(request)) {
      return NextResponse.json(
        { error: "Permintaan ditolak: origin tidak dikenal." },
        { status: 403 },
      );
    }
  }

  // Rate limiting for sensitive routes (only apply to POST/PUT methods to allow normal page views)
  if (path.startsWith("/login") && method === "POST") {
    const { allowed } = checkRateLimit(ip, "login", RATE_LIMITS.LOGIN);
    if (!allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan login. Silakan coba lagi." },
        { status: 429, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  if (path.startsWith("/api/requests")) {
    const { allowed } = checkRateLimit(ip, "api_req", RATE_LIMITS.API_REQUESTS);
    if (!allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan. Silakan coba lagi." },
        { status: 429, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  if ((path.startsWith("/api/feedback") || path.startsWith("/buku-tamu") || path.startsWith("/janji-temu")) && method === "POST") {
    const { allowed } = checkRateLimit(ip, "feedback", RATE_LIMITS.FEEDBACK);
    if (!allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan. Silakan coba lagi." },
        { status: 429, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  const publicPaths = [
    "/", "/layanan", "/tentang", "/kontak", "/faq",
    "/track", "/buku-tamu", "/janji-temu", "/cek-cuti",
    "/register", "/forgot-password",
    "/berita", "/artikel",
  ];
  const isPublicPage = path === "/" || publicPaths.some(
    (p) => path === p || path.startsWith(p + "/"),
  );
  
  // Check maintenance mode
  const isMaintenanceMode = await checkMaintenanceStatus();
  const isExemptFromMaintenance = 
    path === "/maintenance" || 
    path.startsWith("/admin") || 
    path === "/login/petugas" ||
    path.startsWith("/api");

  if (isMaintenanceMode && !isExemptFromMaintenance) {
    let response = NextResponse.redirect(new URL("/maintenance", request.url), 302);
    response.headers.set("X-RateLimit-Limit", "60");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    return response;
  }

  let response: NextResponse;
  if (isPublicPage) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-url", path + request.nextUrl.search);
    response = NextResponse.next({ request: { headers: requestHeaders } });
  } else {
    response = await updateSession(request);
  }

  response.headers.set("X-RateLimit-Limit", "60");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
