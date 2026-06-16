/**
 * Rate limiter using Redis sliding window.
 * Provides per-key rate limiting for API endpoints.
 */
import { redis } from './redis';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
}

/**
 * Check and consume a rate limit token.
 * Uses a sliding window counter in Redis.
 *
 * @param key - Unique identifier (e.g., `ratelimit:login:${ip}` or `ratelimit:ai:${userId}`)
 * @param limit - Maximum number of requests allowed in the window
 * @param windowSeconds - Time window in seconds
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  try {
    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    const windowStart = now - windowMs;

    const pipeline = redis.pipeline();

    // Remove expired entries
    pipeline.zremrangebyscore(key, 0, windowStart);
    // Count current entries
    pipeline.zcard(key);
    // Add current request
    pipeline.zadd(key, now, `${now}:${Math.random()}`);
    // Set expiry on the key
    pipeline.expire(key, windowSeconds);

    const results = await pipeline.exec();

    // zcard result is at index 1
    const currentCount = (results?.[1]?.[1] as number) ?? 0;

    const allowed = currentCount < limit;
    const remaining = Math.max(0, limit - currentCount - (allowed ? 1 : 0));

    // Calculate when the oldest entry in the window expires
    const resetInSeconds = windowSeconds;

    return { allowed, remaining, resetInSeconds };
  } catch (err) {
    // If Redis is down, fail open (allow the request)
    console.error('Rate limit check failed:', err);
    return { allowed: true, remaining: limit, resetInSeconds: 0 };
  }
}

/**
 * Pre-configured rate limiters for common use cases.
 */
export const rateLimits = {
  /** Login attempts: 10 per 15 minutes per IP */
  login: (ip: string) => checkRateLimit(`rl:login:${ip}`, 10, 900),

  /** Registration: 5 per hour per IP */
  register: (ip: string) => checkRateLimit(`rl:register:${ip}`, 5, 3600),

  /** AI requests: 30 per hour per user (FREE plan) */
  aiFree: (userId: string) => checkRateLimit(`rl:ai:free:${userId}`, 30, 3600),

  /** AI requests: 200 per hour per user (PRO plan) */
  aiPro: (userId: string) => checkRateLimit(`rl:ai:pro:${userId}`, 200, 3600),

  /** AI requests: 500 per hour per user (TEAM plan) */
  aiTeam: (userId: string) => checkRateLimit(`rl:ai:team:${userId}`, 500, 3600),

  /** General API: 100 per minute per user */
  api: (userId: string) => checkRateLimit(`rl:api:${userId}`, 100, 60),
} as const;
