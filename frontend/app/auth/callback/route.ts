import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next") ?? "/masyarakat";

  const safeNext = nextParam.startsWith("/")
    ? nextParam === "/dashboard"
      ? "/masyarakat"
      : nextParam
    : "/masyarakat";

  let baseOrigin =
    process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (!baseOrigin) {
    const forwardedHost = request.headers.get("x-forwarded-host");
    const forwardedProto =
      request.headers.get("x-forwarded-proto") || "https";
    baseOrigin = forwardedHost
      ? `${forwardedProto}://${forwardedHost}`
      : url.origin;
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Auth callback error:", error.message);
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent("Gagal masuk dengan Google: " + error.message)}`,
          baseOrigin,
        ),
      );
    }
  }

  const redirectUrl = new URL(safeNext, baseOrigin);
  return NextResponse.redirect(redirectUrl);
}
