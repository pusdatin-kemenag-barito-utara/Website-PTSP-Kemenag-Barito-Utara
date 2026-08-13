import type { APIRoute } from "astro";
import { createClient } from "@/lib/supabase/server";
import { fetchAPI } from "@/lib/api";

export const GET: APIRoute = async (context) => {
  const { url, redirect, cookies, request } = context;
  const code = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next") ?? "/masyarakat";

  const safeNext = nextParam.startsWith("/")
    ? nextParam === "/dashboard"
      ? "/masyarakat"
      : nextParam
    : "/masyarakat";

  let baseOrigin =
    process.env.PUBLIC_SITE_URL ||
    process.env.PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL;
  if (!baseOrigin) {
    const forwardedHost = url.host;
    const forwardedProto = url.protocol.replace(":", "");
    baseOrigin = forwardedHost
      ? `${forwardedProto}://${forwardedHost}`
      : url.origin;
  }

  if (code) {
    const supabase = await createClient({ cookies, request });
    const { data: authData, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Auth callback error:", error.message);
      return redirect(
        `/login?error=${encodeURIComponent("Gagal masuk dengan Google: " + error.message)}`,
        302,
      );
    }

    if (authData?.session?.access_token) {
      cookies.set("ptsp-auth-access-token", authData.session.access_token, {
        path: "/",
        httpOnly: false,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: authData.session.expires_in || 60 * 60 * 24 * 7,
      });
    }

    // Cek profil di Backend Golang: user baru (404) → lengkapi profil, user lama → langsung masuk
    let targetPath = safeNext;
    if (authData?.user) {
      const user = authData.user;
      try {
        const checkRes = await fetchAPI<{ success: boolean; data: any }>(`/users/${user.id}`);

        if (!checkRes?.success) {
          // User belum terdaftar di backend (baru pertama login via Google)
          targetPath = "/login/masyarakat/lengkapi-profil";
        } else {
          const userProfile = checkRes.data;
          const hasPhone = userProfile?.phone && userProfile.phone.trim() !== "" && userProfile.phone !== "-";
          if (!hasPhone) {
            // User ada tapi nomor HP belum diisi
            targetPath = "/login/masyarakat/lengkapi-profil";
          }
          // else: profil sudah lengkap → lanjut ke safeNext (dashboard)
        }
      } catch (err) {
        console.error("Gagal memeriksa status profil OAuth:", err);
        // Saat error (backend down, dll) → tetap lanjutkan ke dashboard, jangan blokir
      }
    }

    const redirectUrl = new URL(targetPath, baseOrigin);

    // Return HTML script: If opened in popup window, redirect parent window and close popup window!
    const htmlResponse = new Response(
      `<!DOCTYPE html>
      <html>
        <head><title>Otentikasi Berhasil</title></head>
        <body>
          <script>
            try {
              if (window.opener && !window.opener.closed) {
                window.opener.location.href = "${redirectUrl.toString()}";
                window.close();
              } else {
                window.location.href = "${redirectUrl.toString()}";
              }
            } catch (e) {
              window.location.href = "${redirectUrl.toString()}";
            }
          </script>
          <p>Memproses otentikasi... Silakan tunggu.</p>
        </body>
      </html>`,
      {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      },
    );

    // Astro workaround: append all cookies manually when returning a custom Response
    for (const header of Array.from(cookies.headers())) {
      htmlResponse.headers.append("Set-Cookie", header);
    }

    return htmlResponse;
  }

  return redirect(new URL(safeNext, baseOrigin).toString(), 302);
};