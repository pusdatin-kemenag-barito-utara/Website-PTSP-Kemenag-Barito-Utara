import { redirect } from "@/lib/next-compat/navigation";
import { headers } from "@/lib/next-compat/headers";
import { memoizeRequest, getRequestContext, tryGetRequestContext } from "@/lib/request-context";
import { createClient } from "@/lib/supabase/server";
import { isSuperAdmin, isAdminRole } from "@/lib/constants";
import { fetchAPI } from "@/lib/api";
import { verifyNativeJWT } from "@/lib/jwt";
import { createAdminClient } from "@/lib/supabase/admin";

export const getCurrentUser = async (reqCtx?: any) => {
  const run = async () => {
    // 1. Verifikasi instan via token native JWT di cookie ptsp-auth
    try {
      const ctx = reqCtx || tryGetRequestContext();
      let token = "";
      if (ctx?.cookies) {
        token = ctx.cookies.get("ptsp-auth")?.value || "";
      }
      if (!token && ctx?.request) {
        const cookieHeader = ctx.request.headers?.get("cookie") || "";
        const match = cookieHeader.match(/ptsp-auth=([^;]+)/);
        if (match) token = match[1];
      }
      if (!token && typeof document !== "undefined") {
        const match = document.cookie.match(/ptsp-auth=([^;]+)/);
        if (match) token = match[1];
      }

      if (token) {
        const claims = verifyNativeJWT(token);
        if (claims && claims.user_id) {
          return {
            id: claims.user_id,
            email: claims.email || "",
            user_metadata: {
              name: claims.nama,
              full_name: claims.nama,
              role: claims.role,
              user_type: claims.user_type,
              nip: claims.nip,
              phone: claims.phone,
              permissions: claims.permissions || [],
              is_verified: claims.is_verified,
            },
          } as any;
        }
      }
    } catch (e) {}

    // 2. Fallback Supabase jika sesi lama
    try {
      const supabase = await createClient(reqCtx);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) return user;
    } catch (e) {}

    // 3. Fallback token di cookie ptsp-auth-access-token via admin client
    try {
      const ctx = reqCtx || tryGetRequestContext();
      let accessToken = ctx?.cookies?.get?.("ptsp-auth-access-token")?.value;
      if (!accessToken && ctx?.request?.headers?.get("cookie")) {
        const match = (ctx.request.headers.get("cookie") || "").match(/ptsp-auth-access-token=([^;]+)/);
        if (match) accessToken = decodeURIComponent(match[1]);
      }
      if (!accessToken && typeof document !== "undefined") {
        const match = (document.cookie || "").match(/ptsp-auth-access-token=([^;]+)/);
        if (match) accessToken = decodeURIComponent(match[1]);
      }
      if (accessToken) {
        // Fast-path: verifikasi masa berlaku & decode payload JWT secara lokal (0ms roundtrip)
        const parts = accessToken.split(".");
        if (parts.length === 3) {
          try {
            const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
            if (payload?.sub && (!payload.exp || payload.exp * 1000 > Date.now())) {
              return {
                id: payload.sub,
                email: payload.email || "",
                user_metadata: payload.user_metadata || {},
              } as any;
            }
          } catch {}
        }

        const admin = createAdminClient();
        const { data } = await admin.auth.getUser(accessToken);
        if (data?.user) return data.user;
      }
    } catch (e) {}

    return null;
  };
  
  const ctx = reqCtx || tryGetRequestContext();
  if (ctx?.locals?.__ptsp_user) return ctx.locals.__ptsp_user;
  if (!ctx) return run();
  
  const key = "current-user";
  let m = (globalThis as any).__ptsp_requestMemo?.get(ctx);
  if (!m) {
    if (!(globalThis as any).__ptsp_requestMemo) {
      (globalThis as any).__ptsp_requestMemo = new WeakMap();
    }
    m = new Map();
    (globalThis as any).__ptsp_requestMemo.set(ctx, m);
  }
  if (m.has(key)) return m.get(key);
  const val = await run();
  m.set(key, val);
  if (ctx?.locals && val) {
    ctx.locals.__ptsp_user = val;
  }
  return val;
};
export const getCurrentProfile = async (reqCtx?: any) => {
  const run = async () => {
    const user = await getCurrentUser(reqCtx);
    if (!user) return null;

    const userEmail = user.email ?? "";
    const userNip = userEmail.includes("@") ? userEmail.split("@")[0] : userEmail;
    const isSuper = isSuperAdmin(userEmail);

    // Fast-path: hanya untuk petugas admin / internal pegawai (menghemat roundtrip),
    // sedangkan untuk pemohon masyarakat kita selalu ambil data real-time dari database
    // agar sinkronisasi 2 arah (nama, phone, alamat yang diubah oleh pemohon maupun admin) selalu terupdate seketika.
    const isPemohon =
      user.user_metadata?.role === "user" ||
      user.user_metadata?.user_type === "eksternal_masyarakat" ||
      user.user_metadata?.user_type === "pemohon";

    if (user.user_metadata?.role && !isPemohon) {
      const meta = user.user_metadata;
      const role = isSuper ? "super_admin" : (meta.role || "user");
      const userType = meta.user_type || (isAdminRole(role) || isSuper ? "internal_admin" : (role === "pegawai" ? "internal_pegawai" : "pemohon"));
      const isInternal =
        userType === "internal_admin" ||
        role === "kepala_kantor" ||
        role === "kasubag_tu" ||
        role === "admin_ptsp" ||
        isSuper ||
        isAdminRole(role);

      return {
        id: user.id,
        email: userEmail,
        role,
        name: meta.name || userEmail.split("@")[0],
        fullName: meta.full_name || meta.name || userEmail.split("@")[0],
        phone: meta.phone || (isSuper ? "000000000" : null),
        address: isSuper ? "-" : null,
        nip: meta.nip || (isInternal ? userNip : null),
        nik: null,
        jabatan: isInternal ? "Petugas PTSP" : null,
        pangkatGolongan: null,
        createdAt: new Date().toISOString(),
        isVerified: meta.is_verified ?? true,
        permissions: (meta.permissions as string[]) || ["ringkasan", "pengajuan", "dokumen_hasil", "layanan"],
        status: "active",
        userType: meta.user_type || (isInternal ? "internal_admin" : "pemohon"),
        avatarUrl: meta.avatar_url || null,
      };
    }

    try {
      const res = await fetchAPI<{ success: boolean; data: any }>(
        `/users/${user.id}`,
      );
      if (res && res.data) {
        const profileData = res.data;
        const email = profileData.email || userEmail;
        const role = isSuper
          ? "super_admin"
          : profileData.role && profileData.role !== "user"
            ? profileData.role
            : user.user_metadata?.role || profileData.role || "user";
        const defaultFallback = isSuper
          ? "-"
          : profileData.user_type === "pemohon"
            ? ""
            : "-";
        
        const isInternal =
          profileData.user_type === "internal_admin" ||
          role === "kepala_kantor" ||
          role === "kasubag_tu" ||
          role === "admin_ptsp" ||
          isSuperAdmin(email) ||
          isAdminRole(role);
          
        return {
          id: profileData.id,
          email,
          role,
          name: profileData.name || profileData.full_name || email.split("@")[0],
          fullName: profileData.full_name || profileData.name || email.split("@")[0],
          phone: profileData.phone || defaultFallback,
          address: profileData.address || defaultFallback,
          nip: profileData.nip || (isInternal ? userNip : null),
          nik: profileData.nik || null,
          jabatan: profileData.jabatan || (isInternal ? "Pegawai" : null),
          pangkatGolongan: profileData.pangkat_golongan || null,
          createdAt: profileData.created_at,
          isVerified: !!profileData.is_verified,
          permissions: (profileData.permissions as string[]) || [],
          status: profileData.status || "active",
          userType: profileData.user_type || (isInternal ? "internal_admin" : "pemohon"),
          avatarUrl: profileData.avatar_url || user.user_metadata?.avatar_url || null,
        };
      }
    } catch (e) {}

    const metadataRole = user.user_metadata?.role || "user";
    const cleanMetaName = (
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      userEmail.split("@")[0]
    ).replace(/[^a-zA-Z0-9.\-\s']/g, "");
    
    const isInternal =
      metadataRole === "kepala_kantor" ||
      metadataRole === "kasubag_tu" ||
      metadataRole === "admin_ptsp" ||
      isSuperAdmin(userEmail) ||
      isAdminRole(metadataRole);

    return {
      id: user.id,
      email: userEmail || null,
      role: isSuper ? "super_admin" : metadataRole,
      name: cleanMetaName,
      fullName: cleanMetaName,
      phone: isSuper ? "000000000" : null,
      address: isSuper ? "-" : null,
      createdAt: new Date().toISOString(),
      isVerified: true,
      permissions: ["ringkasan", "pengajuan", "dokumen_hasil"],
      status: "active",
      userType: isInternal ? "internal_admin" : "pemohon",
    };
  };

  const ctx = reqCtx || tryGetRequestContext();
  if (ctx?.locals?.__ptsp_profile) return ctx.locals.__ptsp_profile;
  if (!ctx) return run();
  
  const key = "current-profile";
  let m = (globalThis as any).__ptsp_requestMemo?.get(ctx);
  if (!m) {
    if (!(globalThis as any).__ptsp_requestMemo) {
      (globalThis as any).__ptsp_requestMemo = new WeakMap();
    }
    m = new Map();
    (globalThis as any).__ptsp_requestMemo.set(ctx, m);
  }
  if (m.has(key)) return m.get(key);
  const val = await run();
  m.set(key, val);
  if (ctx?.locals && val) {
    ctx.locals.__ptsp_profile = val;
  }
  return val;
};

export async function requireAuth(allowIncomplete = false, reqCtx?: any) {
  const user = await getCurrentUser(reqCtx);
  if (!user) {
    const headersList = await headers();
    const ctx = reqCtx || tryGetRequestContext();
    const currentPath = headersList.get("x-url") || (ctx ? ctx.url.pathname + ctx.url.search : "/");
    const referer = headersList.get("referer");

    let callbackUrl = "/masyarakat";
    if (currentPath) {
      callbackUrl = currentPath;
    } else if (referer) {
      try {
        const url = new URL(referer);
        callbackUrl = url.pathname + url.search;
      } catch (e) {}
    }

    redirect(`/login/masyarakat?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  let profile = await getCurrentProfile(reqCtx);

  const userEmail = user.email ?? "";
  const isSuper = isSuperAdmin(userEmail);

  if (profile && profile.status === "inactive") {
    redirect("/login?error=account_inactive");
  }

  if (!allowIncomplete && profile) {
    if (!isSuper && !isSuperAdmin(profile.email)) {
      if (profile.role === "user") {
        if (!profile.phone || !profile.fullName) {
          // bypass lengkapi profil opsional
        }
      }
    }
  }

  return profile as NonNullable<typeof profile>;
}

export async function requireAdmin(reqCtx?: any) {
  const profile = await requireAuth(false, reqCtx);
  if (!isAdminRole(profile.role) && !isSuperAdmin(profile.email)) {
    if (profile.role === "pegawai") {
      redirect("/pegawai");
    }
    redirect("/masyarakat");
  }

  return profile;
}

export async function requireRequestOwnership(
  _requestId: string,
  _userId: string,
) {
  return true;
}

export function hasPermission(profile: any, permission: string): boolean {
  if (!profile) return false;
  if (isSuperAdmin(profile.email) || isAdminRole(profile.role) || profile.role === "super_admin") return true;

  if (profile.role === permission) return true;
  const permissions = (profile.permissions as string[]) || [];
  return permissions.includes(permission);
}

export async function requirePermission(permission: string, reqCtx?: any) {
  const profile = await requireAdmin(reqCtx);
  if (!hasPermission(profile, permission)) {
    redirect("/admin");
  }
  return profile;
}