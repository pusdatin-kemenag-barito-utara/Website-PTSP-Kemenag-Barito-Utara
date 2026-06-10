import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
    
    if (error) {
      console.error("Auth callback error:", error.message);
      // Fallback origin just in case
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
