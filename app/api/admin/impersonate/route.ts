import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSuperAdmin } from "@/lib/constants";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq, or, ilike } from "drizzle-orm";

/**
 * Impersonate a pegawai (employee) dashboard by NIP.
 * Only accessible by Super Admin.
 *
 * Usage: GET /api/admin/impersonate?nip=<NIP>
 *
 * Returns JSON:
 *   { success: true, name, jabatan, unitKerja, magicLink }
 *   { success: false, error: string }
 */
export async function GET(request: NextRequest) {
  // 1. Verify caller is Super Admin
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Tidak terautentikasi." }, { status: 401 });
  }

  if (!isSuperAdmin(user.email ?? "")) {
    return NextResponse.json(
      { success: false, error: "Akses ditolak. Hanya Super Admin." },
      { status: 403 },
    );
  }

  // 2. Get NIP from query params
  const nip = request.nextUrl.searchParams.get("nip")?.trim();
  if (!nip) {
    return NextResponse.json({ success: false, error: "NIP tidak boleh kosong." }, { status: 400 });
  }

  // 3. Find profile — search by nip column OR by email prefix
  // Use ilike to match the prefix just in case the domain differs
  const [profile] = await db
    .select({
      fullName: profiles.fullName,
      email: profiles.email,
      jabatan: profiles.jabatan,
      unitKerja: profiles.unitKerja,
      role: profiles.role,
    })
    .from(profiles)
    .where(or(eq(profiles.nip, nip), ilike(profiles.email, `${nip}@%`)))
    .limit(1);

  if (!profile) {
    return NextResponse.json(
      { success: false, error: `Pegawai dengan NIP "${nip}" tidak ditemukan.` },
      { status: 404 },
    );
  }

  if (!profile.email) {
    return NextResponse.json(
      { success: false, error: "Akun pegawai ini tidak memiliki email terdaftar." },
      { status: 400 },
    );
  }

  // 4. Generate a one-time magic link for the employee using service_role
  const adminClient = createAdminClient();
  const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
    type: "magiclink",
    email: profile.email,
    options: {
      redirectTo: `${request.nextUrl.origin}/pegawai`,
    },
  });

  if (linkError || !linkData?.properties?.action_link) {
    console.error("generateLink error:", linkError);
    return NextResponse.json(
      { success: false, error: "Gagal membuat link masuk. Coba lagi." },
      { status: 500 },
    );
  }

  // 5. Build a custom verification link to bypass Supabase SITE_URL redirect limitations
  let magicLink = linkData.properties.action_link;
  try {
    const internalUrl = new URL(magicLink);
    const token = internalUrl.searchParams.get("token");
    const type = internalUrl.searchParams.get("type") || "magiclink";
    
    // Determine the current origin of the request (works for localhost and production)
    const host = request.headers.get("x-forwarded-host");
    const proto = request.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
    const origin = host ? `${proto}://${host}` : request.nextUrl.origin;
    
    // Point to our custom verify page instead of Supabase Auth server
    magicLink = `${origin}/auth/verify?token=${token}&type=${type}&next=/pegawai`;
  } catch (e) {
    console.error("Failed to parse magic link URL", e);
  }

  return NextResponse.json({
    success: true,
    name: profile.fullName ?? profile.email,
    jabatan: profile.jabatan ?? "-",
    unitKerja: profile.unitKerja ?? "-",
    role: profile.role,
    magicLink: magicLink,
  });
}
