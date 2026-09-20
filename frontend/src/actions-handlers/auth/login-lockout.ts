import { isRateLimited, checkRateLimit, clearRateLimit, resetAllRateLimits } from "@/lib/rate-limiter";
import { headers } from "@/lib/next-compat/headers";

function getPhoneVariations(raw: string): string[] {
  const clean = (raw || "").trim();
  const digits = clean.replace(/\D/g, "");
  if (!digits) return clean ? [clean] : [];

  const variations = new Set<string>();
  variations.add(clean);
  variations.add(digits);

  if (digits.startsWith("0")) {
    variations.add("62" + digits.substring(1));
  } else if (digits.startsWith("62")) {
    variations.add("0" + digits.substring(2));
  }

  return Array.from(variations);
}

export async function checkLoginLockoutAction(identifier: string) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  // Check IP rate limit (10 per minute) - READ ONLY
  const { limited: ipLimited } = isRateLimited(ip, "login_ip", { window: 60 * 1000, max: 10 });
  if (ipLimited) {
    return { error: "Terlalu banyak percobaan dari IP Anda. Silakan tunggu 1 menit." };
  }

  // Check Identifier (email / phone) rate limit (5 per 15 minutes) - READ ONLY
  const variations = getPhoneVariations(identifier);
  for (const v of variations) {
    const { limited } = isRateLimited(v, "login_email", { window: 15 * 60 * 1000, max: 5 });
    if (limited) {
      return { error: "Akun terkunci sementara karena terlalu banyak percobaan gagal. Silakan tunggu 15 menit." };
    }
  }

  return { success: true };
}

export async function recordFailedLoginAction(identifier: string) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  // Increment IP counter
  checkRateLimit(ip, "login_ip", { window: 60 * 1000, max: 10 });

  // Increment Identifier counter
  const variations = getPhoneVariations(identifier);
  for (const v of variations) {
    checkRateLimit(v, "login_email", { window: 15 * 60 * 1000, max: 5 });
  }
}

export async function resetLoginLockoutAction(identifier: string) {
  const variations = getPhoneVariations(identifier);
  for (const v of variations) {
    clearRateLimit(v, "login_email");
  }
  return { success: true };
}

export async function unlockAccountAction(identifier?: string) {
  if (identifier) {
    const variations = getPhoneVariations(identifier);
    for (const v of variations) {
      clearRateLimit(v, "login_email");
    }
  } else {
    resetAllRateLimits();
  }
  return { success: true, message: "Kunci akun berhasil dibuka." };
}

