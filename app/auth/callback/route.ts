import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { auditLogs, profilesPemohon, profiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const nextParam = url.searchParams.get('next') ?? '/masyarakat';

  const safeNext = nextParam.startsWith("/")
    ? (nextParam === "/dashboard" ? "/masyarakat" : nextParam)
    : "/masyarakat";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      
      if (!session || !user) {
        console.error("Auth callback error: Session not established after exchange");
        let redirectOrigin = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || url.origin;
        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent("Gagal mendapatkan sesi masuk. Silakan coba lagi.")}`, redirectOrigin));
      }

      const forwarded = request.headers.get('x-forwarded-for') || "";
      const ip = forwarded.split(",")[0]?.trim() || "unknown";
      db.insert(auditLogs).values({
        performedBy: user.id,
        action: "LOGIN_OAUTH",
        target: "auth",
        afterState: { userId: user.id },
        ip: ip,
      }).catch(() => {});

      // Hitung origin dengan benar untuk reverse proxy
      let baseOrigin = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
      if (!baseOrigin) {
        const forwardedHost = request.headers.get('x-forwarded-host');
        const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
        baseOrigin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : url.origin;
      }

      // Cek & sync data profile & pusdatin saat OAuth Google login
      try {
        const userEmail = user.email || "";
        const fullName = user.user_metadata?.full_name || user.user_metadata?.name || userEmail.split("@")[0] || "Pemohon Google";
        const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

        // 1. Upsert to kemenag_ptsp.profiles
        const existingProfile = await db.query.profiles.findFirst({
          where: eq(profiles.id, user.id),
          columns: { fullName: true },
        });

        const initialName = existingProfile?.fullName || null;

        await db
          .insert(profiles)
          .values({
            id: user.id,
            fullName: initialName,
            email: userEmail,
            avatarUrl,
            role: "user",
            userType: "pemohon",
          })
          .onConflictDoUpdate({
            target: profiles.id,
            set: {
              email: userEmail,
              avatarUrl,
              updatedAt: new Date(),
            },
          });

        const profile = await db.query.profiles.findFirst({
          where: eq(profiles.id, user.id),
          columns: { role: true },
        });

        if (!profile || profile.role === "user") {
          const pemohon = await db.query.profilesPemohon.findFirst({
            where: eq(profilesPemohon.profileId, user.id),
          });

          if (!pemohon || !pemohon.noHp) {
            return NextResponse.redirect(new URL(`/login/masyarakat/lengkapi-profil?next=${encodeURIComponent(safeNext)}`, baseOrigin));
          }
        }
      } catch (checkErr) {
        console.error("Error checking/syncing Google OAuth user to Pusdatin:", checkErr);
      }

    } else {
      console.error("Auth callback error:", error.message);
      let redirectOrigin = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || url.origin;
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent("Gagal masuk dengan Google: " + error.message)}`, redirectOrigin));
    }
  }

  // Mengatasi masalah reverse proxy (Coolify/Nginx) yang membaca host sebagai localhost:3000
  let origin = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
  
  if (!origin) {
    const forwardedHost = request.headers.get('x-forwarded-host');
    const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
    if (forwardedHost) {
      origin = `${forwardedProto}://${forwardedHost}`;
    } else {
      origin = url.origin;
    }
  }

  // Pastikan tidak ada slash ganda jika digabung
  const redirectUrl = new URL(safeNext, origin);
  
  return NextResponse.redirect(redirectUrl);
}
