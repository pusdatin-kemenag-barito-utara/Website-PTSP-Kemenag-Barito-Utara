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

  // Rate limiting for sensitive routes
  if (path.startsWith("/login")) {
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

  if (path.startsWith("/api/feedback") || path.startsWith("/buku-tamu") || path.startsWith("/janji-temu")) {
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
    "/track", "/buku-tamu", "/janji-temu",
    "/register", "/forgot-password",
    "/berita", "/artikel",
  ];
  const isPublicPage = publicPaths.some(
    (p) => path === p || path.startsWith(p + "/"),
  );

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
