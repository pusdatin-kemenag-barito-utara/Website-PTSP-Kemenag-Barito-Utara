import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { profiles, serviceRequests } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { isSuperAdmin, isAdminRole } from "@/lib/constants";

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.user ?? null;
});

export const getCurrentProfile = cache(async () => {
  const user = await getCurrentUser();
  if (!user) return null;

  const data = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
  });

  return data ?? null;
});

import { headers } from "next/headers";

export async function requireAuth(allowIncomplete = false) {
  const user = await getCurrentUser();
  if (!user) {
    const headersList = await headers();
    // Get the current path from the custom header set by middleware
    const currentPath = headersList.get("x-url");
    const referer = headersList.get("referer");

    let callbackUrl = "/dashboard";

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

  // Jika user login via Google dan profil belum dibuat oleh trigger
  if (!profile && user) {
    try {
      await db.insert(profiles).values({
        id: user.id,
        email: user.email,
        fullName: user.user_metadata?.full_name || "",
        role: "user",
      });

      // Ambil langsung dari DB untuk bypass React cache()
      const newProfile = await db.query.profiles.findFirst({
        where: eq(profiles.id, user.id),
      });
      profile = newProfile ?? null;
    } catch (e) {
      // Jika error karena profile sudah dibuat oleh trigger (duplicate key),
      // kita fetch langsung dari database untuk mendapatkan profilnya.
      const existingProfile = await db.query.profiles.findFirst({
        where: eq(profiles.id, user.id),
      });
      if (existingProfile) {
        profile = existingProfile;
      } else {
        console.error("Gagal auto-create profil dan fetch ulang:", e);
      }
    }
  }

  // Fallback if profile creation completely failed but we must return something
  if (!profile) {
    profile = { 
      id: user.id, 
      email: user.email ?? null, 
      role: "user",
      fullName: user.user_metadata?.full_name ?? "",
      phone: null,
      address: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      nip: null,
      jabatan: null,
      unitKerja: null,
      isVerified: true,
      permissions: ["ringkasan", "pengajuan", "dokumen_hasil"],
      avatarUrl: null,
    };
  }

  if (!allowIncomplete) {
    // Jika role user (pemohon) dan profil belum lengkap, paksa lengkapi profil
    if (profile!.role === "user") {
      if (!profile!.phone || !profile!.fullName || !profile!.address) {
        redirect("/lengkapi-profil");
      }
    }
  }

  return profile as NonNullable<typeof profile>;
}

export async function requireAdmin() {
  const profile = await requireAuth();
  // Super admin ditentukan oleh email (hardcoded), bukan role di database
  if (!isAdminRole(profile.role) && !isSuperAdmin(profile.email)) {
    redirect("/dashboard");
  }
  if (!profile.isVerified && !isSuperAdmin(profile.email)) {
    redirect("/dashboard");
  }
  return profile;
}

export async function requireRequestOwnership(
  requestId: string,
  userId: string,
) {
  const data = await db.query.serviceRequests.findFirst({
    where: eq(serviceRequests.id, requestId),
    columns: { userId: true },
  });

  return !!data && data.userId === userId;
}

/**
 * Check if a profile has a specific permission or is a super admin
 */
export function hasPermission(profile: any, permission: string): boolean {
  if (!profile) return false;
  if (isSuperAdmin(profile.email)) return true;

  if (profile.role === permission) return true;
  const permissions = (profile.permissions as string[]) || [];
  return permissions.includes(permission);
}

/**
 * Require a specific permission or super admin access.
 * Throws an error or redirects if not authorized.
 */
export async function requirePermission(permission: string) {
  const profile = await requireAdmin();
  if (!hasPermission(profile, permission)) {
    redirect("/admin");
  }
  return profile;
}
