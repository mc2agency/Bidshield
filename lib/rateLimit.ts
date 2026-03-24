import { LRUCache } from "lru-cache";

// NOTE: This in-memory rate limiter works correctly within a single serverless
// function instance. On Vercel, each warm instance maintains its own counter,
// so a user hitting N concurrent cold instances could exceed the limit by up to
// N×. For a truly distributed rate limit, upgrade to Upstash Redis:
//
//   npm install @upstash/ratelimit @upstash/redis
//
//   import { Ratelimit } from "@upstash/ratelimit";
//   import { Redis } from "@upstash/redis";
//
//   const ratelimit = new Ratelimit({
//     redis: Redis.fromEnv(),            // UPSTASH_REDIS_REST_URL + TOKEN in env
//     limiter: Ratelimit.slidingWindow(10, "60s"),
//   });
//
//   const { success, limit, remaining, reset } = await ratelimit.limit(userId);
//
// Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to .env.local and
// the Vercel dashboard. The primary guard on every AI endpoint is Clerk
// authentication — an unauthenticated caller cannot reach this check at all.

const ratelimit = new LRUCache<string, number[]>({
  max: 500,
  ttl: 1000 * 60, // 1-minute window
});

const DEFAULT_LIMIT = 10;
const WINDOW_SECS = 60;

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
}

/**
 * Returns an object describing whether the request is allowed and how many
 * calls remain in the current window. Use `allowed` to decide whether to
 * proceed; include `limit` and `remaining` in the response headers (L1).
 *
 * Default: 10 AI calls per minute per user (per function instance).
 */
export function checkRateLimit(userId: string, limit = DEFAULT_LIMIT): RateLimitResult {
  const now = Date.now();
  const windowMs = WINDOW_SECS * 1000;

  const timestamps = ratelimit.get(userId) ?? [];
  const recent = timestamps.filter((t) => now - t < windowMs);

  if (recent.length >= limit) {
    return { allowed: false, limit, remaining: 0 };
  }

  ratelimit.set(userId, [...recent, now]);
  return { allowed: true, limit, remaining: limit - recent.length - 1 };
}

/**
 * Standard 429 response headers for rate-limited requests.
 * Clients can use Retry-After to implement back-off.
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "RateLimit-Limit": String(result.limit),
    "RateLimit-Remaining": String(result.remaining),
    "Retry-After": String(WINDOW_SECS),
  };
}
