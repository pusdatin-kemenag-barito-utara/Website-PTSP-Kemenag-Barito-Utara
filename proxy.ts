import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// In-memory store for rate limiting (Note: resets on server restart/cold start)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

const LIMITS = {
  LOGIN: { window: 60 * 1000, max: 50 }, // Increased to 50 for smoother dev
  REQUESTS: { window: 60 * 1000, max: 20 }, // Increased to 20
};

export async function proxy(request: NextRequest) {
  const ip =
    (request as any).ip ??
    request.headers.get("x-forwarded-for") ??
    "127.0.0.1";
  const path = request.nextUrl.pathname;

  // 1. Rate Limiting Logic for Sensitive Routes
  if (path.startsWith("/login") || path.startsWith("/api/requests")) {
    const now = Date.now();
    const isLogin = path.startsWith("/login");
    const key = `${ip}:${isLogin ? "login" : "req"}`;
    const rateData = rateLimitMap.get(key) || { count: 0, lastReset: now };

    // Reset window if time passed
    const limit = isLogin ? LIMITS.LOGIN : LIMITS.REQUESTS;
    if (now - rateData.lastReset > limit.window) {
      rateData.count = 0;
      rateData.lastReset = now;
    }

    rateData.count++;
    rateLimitMap.set(key, rateData);

    if (rateData.count > limit.max) {
      return new NextResponse(
        JSON.stringify({
          error:
            "Terlalu banyak permintaan. Silakan coba lagi dalam beberapa menit.",
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  }

  // 2. Standard Session Update
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
