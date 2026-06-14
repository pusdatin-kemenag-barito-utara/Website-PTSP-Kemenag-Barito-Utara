"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createAuditLog } from "@/lib/audit";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function signOutAction(redirectToPath: string = "/") {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.user) {
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, session.user.id),
      columns: { id: true },
    });
    if (profile) {
      await createAuditLog({
        adminId: profile.id,
        action: "LOGOUT",
        entityType: "auth",
        entityId: session.user.id,
      });
    }
  }

  await supabase.auth.signOut();
  redirect(redirectToPath);
}
