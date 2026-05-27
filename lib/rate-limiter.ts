type RateLimitConfig = {
  window: number;
  max: number;
};

type RateLimitEntry = {
  count: number;
  lastReset: number;
};

const store = new Map<string, RateLimitEntry>();

function getKey(ip: string, prefix: string): string {
  return `${prefix}:${ip}`;
}

function checkWindow(entry: RateLimitEntry, now: number, window: number): RateLimitEntry {
  if (now - entry.lastReset > window) {
    return { count: 0, lastReset: now };
  }
  return entry;
}

export function checkRateLimit(
  ip: string,
  prefix: string,
  config: RateLimitConfig,
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const key = getKey(ip, prefix);
  const entry = checkWindow(store.get(key) || { count: 0, lastReset: now }, now, config.window);
  entry.count++;
  store.set(key, entry);
  return {
    allowed: entry.count <= config.max,
    remaining: Math.max(0, config.max - entry.count),
  };
}

export const RATE_LIMITS = {
  LOGIN: { window: 60 * 1000, max: 10 },
  FORGOT_PASSWORD: { window: 60 * 1000, max: 5 },
  API_REQUESTS: { window: 60 * 1000, max: 20 },
  FEEDBACK: { window: 60 * 1000, max: 5 },
} as const satisfies Record<string, RateLimitConfig>;
