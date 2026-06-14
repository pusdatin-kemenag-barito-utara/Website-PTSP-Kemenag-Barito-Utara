"use server";

import { checkRateLimit } from "@/lib/rate-limiter";
import { headers } from "next/headers";

export async function checkLoginLockoutAction(email: string) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  // Check IP rate limit (10 per minute)
  const { allowed: ipAllowed } = checkRateLimit(ip, "login_ip", { window: 60 * 1000, max: 10 });
  if (!ipAllowed) {
    return { error: "Terlalu banyak percobaan dari IP Anda. Silakan tunggu 1 menit." };
  }

  // Check Email rate limit (5 per 15 minutes)
  const { allowed: emailAllowed } = checkRateLimit(email, "login_email", { window: 15 * 60 * 1000, max: 5 });
  if (!emailAllowed) {
    return { error: "Akun terkunci sementara karena terlalu banyak percobaan gagal. Silakan tunggu 15 menit." };
  }

  return { success: true };
}

export async function recordFailedLoginAction(email: string) {
  // This just increments the rate limit counter for the email
  checkRateLimit(email, "login_email", { window: 15 * 60 * 1000, max: 5 });
}
