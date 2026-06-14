"use server";

import { db } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function logLoginAction() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const headerList = await headers();
    const rawIp = headerList.get("x-forwarded-for") || "";
    const ip = rawIp.split(",")[0]?.trim() || "unknown";

    await db.insert(auditLogs).values({
      adminId: user.id,
      action: "LOGIN_SUCCESS",
      entityType: "auth",
      entityId: user.id,
      ipAddress: ip,
    });
  } catch {
    // Silent fail
  }
}

export async function logFailedLoginAction(email: string, reason: string) {
  try {
    const headerList = await headers();
    const rawIp = headerList.get("x-forwarded-for") || "";
    const ip = rawIp.split(",")[0]?.trim() || "unknown";

    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
      columns: { id: true }
    });

    if (user) {
      await db.insert(auditLogs).values({
        adminId: user.id,
        action: "LOGIN_FAILED",
        entityType: "auth",
        entityId: user.id,
        ipAddress: ip,
        details: { reason }
      });
    }
  } catch {
    // Silent fail
  }
}
