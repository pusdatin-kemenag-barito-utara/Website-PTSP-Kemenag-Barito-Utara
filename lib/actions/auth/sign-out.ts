"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createAuditLog } from "@/lib/audit";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function signOutAction(redirectToPath: string = "/") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, user.id),
      columns: { id: true },
    });
    if (profile) {
      await createAuditLog({
        adminId: profile.id,
        action: "LOGOUT",
        entityType: "auth",
        entityId: user.id,
      });
    }
  }

  await supabase.auth.signOut();
  redirect(redirectToPath);
}
