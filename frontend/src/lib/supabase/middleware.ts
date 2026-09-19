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

  // Jika pengguna memiliki sesi native Golang JWT (ptsp-auth),
  // jangan sentuh atau hapus cookie sesi tersebut!
  const authCookie = cookieStore.get("ptsp-auth")?.value;
  if (authCookie) {
    return;
  }

  // Fast-path: jika access token Supabase masih berlaku (> 2 menit),
  // lewati panggilan jaringan ke server Supabase cloud untuk navigasi instan (0ms latency).
  const token = cookieStore.get("ptsp-auth-access-token")?.value;
  if (token) {
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
        if (payload?.exp && payload.exp * 1000 > Date.now() + 120000) {
          return;
        }
      }
    } catch {}
  }

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookieOptions: {
      name: "ptsp-auth-access-token",
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
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              cookieStore.set(name, value, options as any);
            } catch {}
          });
        } catch {}
      },
    },
  });

  try {
    const { error } = await supabase.auth.getUser();
    if (error && error.status === 400 && error.code === "refresh_token_not_found") {
      // Hanya hapus legacy cookie Supabase, jangan pernah hapus ptsp-auth
      try {
        cookieStore.delete("ptsp-auth-access-token");
      } catch {}
    }
  } catch {}
}