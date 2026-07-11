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
      performedBy: user.id,
      action: "LOGIN_SUCCESS",
      target: "auth",
      afterState: { userId: user.id },
      ip: ip,
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
        performedBy: user.id,
        action: "LOGIN_FAILED",
        target: "auth",
        afterState: { userId: user.id, reason },
        ip: ip,
      });
    }
  } catch {
    // Silent fail
  }
}
