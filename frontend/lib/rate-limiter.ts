// Simple in-memory rate limiter for server actions / middleware

type RateLimitRecord = {
  count: number;
  resetTime: number;
};

const store = new Map<string, RateLimitRecord>();

export const RATE_LIMITS = {
  FORGOT_PASSWORD: { window: 15 * 60 * 1000, max: 5 }, // 5 requests per 15 min
  LOGIN_IP: { window: 60 * 1000, max: 10 },           // 10 requests per minute
  LOGIN_EMAIL: { window: 15 * 60 * 1000, max: 5 },     // 5 requests per 15 min
};

export function checkRateLimit(
  key: string,
  namespace: string = "default",
  config: { window: number; max: number } = { window: 60 * 1000, max: 10 }
): { allowed: boolean; remaining: number; resetTime: number } {
  const fullKey = `${namespace}:${key}`;
  const now = Date.now();
  const record = store.get(fullKey);

  if (!record || now > record.resetTime) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetTime: now + config.window,
    };
    store.set(fullKey, newRecord);
    return {
      allowed: true,
      remaining: config.max - 1,
      resetTime: newRecord.resetTime,
    };
  }

  if (record.count >= config.max) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  record.count += 1;
  store.set(fullKey, record);

  return {
    allowed: true,
    remaining: config.max - record.count,
    resetTime: record.resetTime,
  };
}
