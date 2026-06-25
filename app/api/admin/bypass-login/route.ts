import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSuperAdmin } from "@/lib/constants";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Bypass login route for Super Admin.
 * Allows Super Admin to access pemohon or pegawai dashboards
 * without re-authenticating.
 *
 * Usage: GET /api/admin/bypass-login?target=/pegawai
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Only allow super admin
  const email = user.email ?? "";
  if (!isSuperAdmin(email)) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  const target = request.nextUrl.searchParams.get("target") || "/dashboard";

  // Safety check - only allow internal paths
  const allowedTargets = ["/dashboard", "/pegawai"];
  const isAllowed = allowedTargets.some(
    (t) => target === t || target.startsWith(t + "/"),
  );

  if (!isAllowed) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // If target is /pegawai, we need to ensure the profile role is treated as pegawai-compatible
  // The super admin session is already valid, so just redirect
  return NextResponse.redirect(new URL(target, request.url));
}
