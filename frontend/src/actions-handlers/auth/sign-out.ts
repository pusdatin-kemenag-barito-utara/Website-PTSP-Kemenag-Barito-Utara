import { createClient } from "@/lib/supabase/server";
import { redirect } from "@/lib/next-compat/navigation";
import { tryGetRequestContext } from "@/lib/request-context";
import { fetchAPI } from "@/lib/api";

export async function signOutAction(redirectToPath: string = "/", injectedCtx?: any) {
  if (typeof redirectToPath !== "string") {
    // Jika redirectToPath adalah object (karena diinjeksi oleh context server), kita kembalikan ke '/'
    injectedCtx = redirectToPath;
    redirectToPath = "/";
  }

  // 1. Hapus cookie ptsp-auth dan ptsp-auth-access-token dari sesi Astro
  const ctx = tryGetRequestContext();
  if (ctx?.cookies) {
    ctx.cookies.delete("ptsp-auth", { path: "/" });
    ctx.cookies.set("ptsp-auth", "", {
      path: "/",
      maxAge: 0,
      expires: new Date(0),
      httpOnly: true,
      sameSite: "lax",
    });

    ctx.cookies.delete("ptsp-auth-access-token", { path: "/" });
    ctx.cookies.set("ptsp-auth-access-token", "", {
      path: "/",
      maxAge: 0,
      expires: new Date(0),
      httpOnly: false,
      sameSite: "lax",
    });
  }

  // 2. Beri tahu backend Golang
  try {
    await fetchAPI("/auth/logout", { method: "POST" });
  } catch {}

  // 3. Bersihkan sesi Supabase jika ada
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {}

  redirect(redirectToPath);
}

