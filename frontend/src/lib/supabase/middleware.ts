import { createServerClient } from "@supabase/ssr";
import { getRequestContext } from "@/lib/request-context";

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL || "";
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY ||
  process.env.PUBLIC_SUPABASE_ANON_KEY ||
  "";

export async function updateSession() {
  const ctx = getRequestContext();
  const cookieStore = ctx.cookies;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookieOptions: {
      name: "ptsp-auth",
    },
    cookies: {
      getAll() {
        const cookieHeader = ctx.request.headers.get("cookie") || "";
        if (!cookieHeader) return [];
        return cookieHeader.split(";").map((cookie) => {
          const [name, ...rest] = cookie.trim().split("=");
          return { name: name.trim(), value: rest.join("=").trim() };
        });
      },
      setAll(
        cookiesToSet: Array<{
          name: string;
          value: string;
          options?: { maxAge?: number; path?: string; domain?: string; secure?: boolean; httpOnly?: boolean; sameSite?: "lax" | "strict" | "none"; expires?: Date };
        }>,
      ) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options as any);
        });
      },
    },
  });

  const { error } = await supabase.auth.getUser();
  if (error && error.status === 400 && error.code === "refresh_token_not_found") {
    // Cookie stale/invalid — hapus semua auth cookie agar tidak looping
    const cookieHeader = ctx.request.headers.get("cookie") || "";
    const cookiesToDelete = cookieHeader
      .split(";")
      .map((c) => c.trim().split("=")[0].trim())
      .filter((name) => name.startsWith("ptsp-auth"));

    for (const name of cookiesToDelete) {
      cookieStore.delete(name);
    }
  }
}