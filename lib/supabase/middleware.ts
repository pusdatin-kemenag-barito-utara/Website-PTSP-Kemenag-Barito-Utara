import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-url", request.nextUrl.pathname + request.nextUrl.search);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: Array<{
            name: string;
            value: string;
            options?: CookieOptions;
          }>,
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser().catch((e) => {
    console.error("Supabase auth check failed in middleware:", e);
    return { data: { user: null } };
  });

  // Build response — only set cookies if a session was established/exchanged
  const supabaseResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Copy session cookies from the incoming request onto the response
  const sessionCookieNames = [
    "sb-" + process.env.NEXT_PUBLIC_SUPABASE_URL!.split("//")[1].split(".")[0] + "-auth-token",
    "sb-" + process.env.NEXT_PUBLIC_SUPABASE_URL!.split("//")[1].split(".")[0] + "-auth-token-code-verifier",
  ];
  for (const name of sessionCookieNames) {
    const cookie = request.cookies.get(name);
    if (cookie) {
      supabaseResponse.cookies.set(name, cookie.value, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
    }
  }

  return supabaseResponse;
}
