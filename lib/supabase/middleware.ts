import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-url", request.nextUrl.pathname + request.nextUrl.search);

  let supabaseResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookieOptions: {
        name: 'ptsp-auth',
      },
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
          supabaseResponse = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    },
  );

  const { error } = await supabase.auth.getUser();
  if (error && error.status === 400 && error.code === "refresh_token_not_found") {
    // Cookie stale/invalid — hapus semua auth cookie agar tidak looping
    const cookiesToDelete = request.cookies
      .getAll()
      .filter((c) => c.name.startsWith("ptsp-auth"))
      .map((c) => c.name);

    for (const name of cookiesToDelete) {
      supabaseResponse.cookies.delete(name);
    }
  }

  return supabaseResponse;
}
