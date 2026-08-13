import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { tryGetRequestContext, getRequestContext } from "@/lib/request-context";
import type { AstroCookies } from "astro";

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL || "";
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY ||
  process.env.PUBLIC_SUPABASE_ANON_KEY ||
  "";

export async function createClient(astroContext?: { cookies?: AstroCookies; request?: Request }) {
  const ctx = astroContext?.cookies && astroContext?.request
    ? { cookies: astroContext.cookies, request: astroContext.request }
    : tryGetRequestContext();

  if (!ctx) {
    // Return dummy client jika dipanggil tanpa server context
    return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      cookies: {
        getAll() { return []; },
        setAll() {},
      },
    });
  }

  const cookieStore = ctx.cookies;

  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookieOptions: {
      name: "ptsp-auth",
    },
    cookies: {
      getAll() {
        const cookiesMap = new Map<string, string>();
        
        // 1. Baca dari Request Header "cookie"
        const cookieHeader = ctx.request?.headers?.get("cookie") || "";
        if (cookieHeader) {
          cookieHeader.split(";").forEach((cookie) => {
            const [name, ...rest] = cookie.trim().split("=");
            if (name) cookiesMap.set(name.trim(), decodeURIComponent(rest.join("=").trim()));
          });
        }

        // 2. Tambahkan / override dari AstroCookies jika ada
        const astroCookies = ctx.cookies as any;
        if (astroCookies && typeof astroCookies.getAll === "function") {
          try {
            const allCookies = astroCookies.getAll();
            if (Array.isArray(allCookies)) {
              allCookies.forEach((c: any) => {
                if (c && c.name) cookiesMap.set(c.name, c.value);
              });
            }
          } catch (e) {}
        }

        return Array.from(cookiesMap.entries()).map(([name, value]) => ({ name, value }));
      },
      setAll(
        cookiesToSet: Array<{
          name: string;
          value: string;
          options?: CookieOptions;
        }>,
      ) {
        cookiesToSet.forEach(({ name, value, options }) => {
          const cookieOptions = { ...options };
          if (process.env.NODE_ENV !== "production") {
            cookieOptions.secure = false;
          }
          if (cookieOptions.domain === "" || cookieOptions.domain === null) {
            delete cookieOptions.domain;
          }
          if (typeof cookieOptions.sameSite === "string" && cookieOptions.sameSite.toLowerCase() === "lax") {
            cookieOptions.sameSite = "lax"; // Ensure correct casing or just leave it
          }
          cookieStore.set(name, value, cookieOptions as any);
        });
      },
    },
  });
}