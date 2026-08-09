import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchAPI } from "@/lib/api";

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
    const { data: authData, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Auth callback error:", error.message);
      return NextResponse.redirect(
        new URL(
          `/login?error=${encodeURIComponent("Gagal masuk dengan Google: " + error.message)}`,
          baseOrigin,
        ),
      );
    }

    // Cek profil di Backend Golang dan sync jika baru / belum lengkap
    let targetPath = safeNext;
    if (authData?.user) {
      const user = authData.user;
      try {
        const checkRes = await fetchAPI<{ success: boolean; data: any }>(`/admin/users/${user.id}`);
        const userProfile = checkRes?.data;

        // Jika profile belum terdata di backend / pusdatin atau nomor hp masih kosong, alihkan ke halaman Lengkapi Profil
        if (!userProfile || !userProfile.phone || userProfile.phone.trim() === "" || userProfile.phone === "-") {
          targetPath = "/login/masyarakat/lengkapi-profil";
        }
      } catch (err) {
        console.error("Gagal memeriksa status profil OAuth:", err);
      }
    }

    const redirectUrl = new URL(targetPath, baseOrigin);

    // Return HTML script: If opened in popup window, redirect parent window and close popup window!
    return new NextResponse(
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
      }
    );
  }

  const redirectUrl = new URL(safeNext, baseOrigin);
  return NextResponse.redirect(redirectUrl);
}
