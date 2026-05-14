import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { isSuperAdmin, isAdminRole } from "@/lib/constants";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;

  const data = await prisma.profiles.findUnique({
    where: { id: user.id },
  });

  return data;
}

export async function requireAuth() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login");
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
  const data = await prisma.service_requests.findUnique({
    where: { id: requestId },
    select: { user_id: true },
  });

  return !!data && data.user_id === userId;
}
