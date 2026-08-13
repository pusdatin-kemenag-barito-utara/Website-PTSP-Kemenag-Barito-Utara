import { headers } from "@/lib/next-compat/headers";
import { createClient } from "@/lib/supabase/server";

export async function logLoginAction() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const headerList = await headers();
    const rawIp = headerList.get("x-forwarded-for") || "";
    const ip = rawIp.split(",")[0]?.trim() || "unknown";

    // Managed silently by Supabase / Golang Audit Logs
  } catch {
    // Silent fail
  }
}

export async function logFailedLoginAction(email: string, reason: string) {
  try {
    const headerList = await headers();
    const rawIp = headerList.get("x-forwarded-for") || "";
    const ip = rawIp.split(",")[0]?.trim() || "unknown";

    // Managed silently by Supabase / Golang Audit Logs
  } catch {
    // Silent fail
  }
}
