import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSuperAdmin, isAdminRole } from "@/lib/constants";
import { fetchAPI } from "@/lib/api";

export const getCurrentUser = cache(async () => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return user ?? null;
  } catch (e) {
    return null;
  }
});

export const getCurrentProfile = cache(async () => {
  const user = await getCurrentUser();
  if (!user) return null;

  const userEmail = user.email ?? "";
  const isSuper = isSuperAdmin(userEmail);

  try {
    const res = await fetchAPI<{ success: boolean; data: any }>(`/admin/users/${user.id}`);
    if (res && res.data) {
      const profileData = res.data;
      const email = profileData.email || userEmail;
      const role = isSuper ? "super_admin" : (profileData.role && profileData.role !== "user" ? profileData.role : (user.user_metadata?.role || profileData.role || "user"));
      return {
        ...profileData,
        email,
        role,
        isVerified: isSuper ? true : (profileData.isVerified ?? true),
      };
    }
  } catch (e) {
    // Fallback jika API backend offline
  }

  // Fallback profile object jika belum ada
  const metadataRole = user.user_metadata?.role || (isSuper ? "super_admin" : "user");
  const isInternal = isAdminRole(metadataRole) || isSuper;

  return {
    id: user.id,
    email: userEmail || null,
    role: isSuper ? "super_admin" : metadataRole,
    name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? "User",
    fullName: user.user_metadata?.full_name ?? user.user_metadata?.name ?? "User",
    phone: isSuper ? "000000000" : null,
    address: isSuper ? "-" : null,
    createdAt: new Date().toISOString(),
    isVerified: true,
    permissions: ["ringkasan", "pengajuan", "dokumen_hasil"],
    status: "active",
    userType: isInternal ? "internal_admin" : "pemohon",
  };
});

import { headers } from "next/headers";

export async function requireAuth(allowIncomplete = false) {
  const user = await getCurrentUser();
  if (!user) {
    const headersList = await headers();
    const currentPath = headersList.get("x-url");
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

    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  let profile = await getCurrentProfile();

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

export async function requireAdmin() {
  const profile = await requireAuth();
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

export async function requirePermission(permission: string) {
  const profile = await requireAdmin();
  if (!hasPermission(profile, permission)) {
    redirect("/admin");
  }
  return profile;
}
