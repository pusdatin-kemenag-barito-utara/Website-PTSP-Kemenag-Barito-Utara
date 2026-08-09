import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

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

let maintenanceCache: { isMaintenance: boolean; expiresAt: number } | null = null;

async function checkMaintenanceStatus(): Promise<boolean> {
  if (process.env.NODE_ENV === "development") {
    return false;
  }

  const now = Date.now();
  if (maintenanceCache && now < maintenanceCache.expiresAt) {
    return maintenanceCache.isMaintenance;
  }

  try {
    const pusdatinUrl = process.env.NEXT_PUBLIC_PUSDATIN_URL || "https://pusdatin.kemenag-baritoutara.com";
    const appId = "ptsp-kemenag"; 
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 600);

    const response = await fetch(
      `${pusdatinUrl}/api/public/apps/${appId}/status`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
    if (!response.ok) {
      maintenanceCache = { isMaintenance: false, expiresAt: now + 60000 };
      return false;
    }
    const data = await response.json();
    const isMaintenance = data?.status === "maintenance";
    maintenanceCache = { isMaintenance, expiresAt: now + 60000 };
    return isMaintenance;
  } catch (error) {
    maintenanceCache = { isMaintenance: false, expiresAt: now + 30000 };
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



  const publicPaths = [
    "/", "/layanan", "/tentang", "/kontak", "/faq",
    "/track", "/buku-tamu", "/janji-temu", "/cek-cuti",
    "/register", "/forgot-password",
    "/berita", "/artikel",
    "/kebijakan-privasi", "/syarat-ketentuan"
  ];
  const isPublicPage = path === "/" || publicPaths.some(
    (p) => path === p || path.startsWith(p + "/"),
  );
  
  let response: NextResponse;
  if (isPublicPage) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-url", path + request.nextUrl.search);
    response = NextResponse.next({ request: { headers: requestHeaders } });
  } else {
    try {
      response = await updateSession(request);
    } catch {
      // Fallback: lanjutkan tanpa session refresh jika updateSession() throw
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-url", path + request.nextUrl.search);
      response = NextResponse.next({ request: { headers: requestHeaders } });
    }
  }

  const isExemptFromMaintenance = 
    path === "/maintenance" || 
    path.startsWith("/api");

  // Check maintenance mode only if the path is not exempt
  let isMaintenanceMode = false;
  if (!isExemptFromMaintenance) {
    isMaintenanceMode = await checkMaintenanceStatus();
  }

  if (isMaintenanceMode) {
    const redirectRes = NextResponse.redirect(new URL("/maintenance", request.url), 302);
    
    // Copy cookies from updateSession to ensure session doesn't die during maintenance
    const setCookies = response.headers.getSetCookie();
    if (setCookies) {
      for (const cookie of setCookies) {
        redirectRes.headers.append("Set-Cookie", cookie);
      }
    }
    response = redirectRes;
  }

  response.headers.set("X-RateLimit-Limit", "60");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
