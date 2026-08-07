import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSuperAdmin } from "@/lib/constants";
import { fetchAPI } from "@/lib/api";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: "Tidak terautentikasi." },
      { status: 401 },
    );
  }

  if (!isSuperAdmin(user.email ?? "")) {
    return NextResponse.json(
      { success: false, error: "Akses ditolak. Hanya Super Admin." },
      { status: 403 },
    );
  }

  const nip = request.nextUrl.searchParams.get("nip")?.trim();
  if (!nip) {
    return NextResponse.json(
      { success: false, error: "NIP tidak boleh kosong." },
      { status: 400 },
    );
  }

  let profile: any = null;
  try {
    const res = await fetchAPI<any>(`/pegawai/cuti?nip=${encodeURIComponent(nip)}`);
    profile = res?.data || null;
  } catch {
    profile = null;
  }

  const email = `${nip}@kemenag.go.id`;
  const adminClient = createAdminClient();
  const { data: linkData, error: linkError } =
    await adminClient.auth.admin.generateLink({
      type: "magiclink",
      email: email,
      options: {
        redirectTo: `${request.nextUrl.origin}/pegawai`,
      },
    });

  if (linkError || !linkData?.properties?.action_link) {
    return NextResponse.json(
      { success: false, error: "Gagal membuat link masuk. Coba lagi." },
      { status: 500 },
    );
  }

  let magicLink = linkData.properties.action_link;
  try {
    const internalUrl = new URL(magicLink);
    const token = internalUrl.searchParams.get("token");
    const type = internalUrl.searchParams.get("type") || "magiclink";

    const host = request.headers.get("x-forwarded-host");
    const proto =
      request.headers.get("x-forwarded-proto") ||
      (host?.includes("localhost") ? "http" : "https");
    const origin = host ? `${proto}://${host}` : request.nextUrl.origin;

    magicLink = `${origin}/auth/verify?token=${token}&type=${type}&next=/pegawai`;
  } catch (e) {
    console.error("Failed to parse magic link URL", e);
  }

  return NextResponse.json({
    success: true,
    name: profile?.name || profile?.nama || `Pegawai ${nip}`,
    jabatan: profile?.jabatan || "-",
    unitKerja: profile?.unitKerja || "-",
    role: "pegawai",
    magicLink: magicLink,
  });
}
