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
    data: { user },
  } = await supabase.auth.getUser();

  return user;
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

export async function requireAuth() {
  const profile = await getCurrentProfile();
  if (!profile) {
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
  return profile;
}

export async function requireAdmin() {
  const profile = await requireAuth();
  // Super admin ditentukan oleh email (hardcoded), bukan role di database
  if (!isAdminRole(profile.role) && !isSuperAdmin(profile.email)) {
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
