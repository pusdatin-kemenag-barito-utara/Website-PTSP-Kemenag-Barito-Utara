import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { auditLogs } from '@/lib/db/schema';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const nextParam = url.searchParams.get('next') ?? '/dashboard';

  const safeNext = nextParam.startsWith("/")
    ? nextParam
    : "/dashboard";

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
        adminId: user.id,
        action: "LOGIN_OAUTH",
        entityType: "auth",
        entityId: user.id,
        ipAddress: ip,
      }).catch(() => {});
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
