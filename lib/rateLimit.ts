import { LRUCache } from "lru-cache";

// P0-5: Distributed rate limiting via Upstash Redis.
//
// When UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set in the
// environment, this module uses Upstash's sliding-window rate limiter which
// works correctly across all Vercel serverless instances.
//
// Without those env vars, it falls back to the in-memory LRU approach which
// only limits within a single instance (suitable for development).
//
// To enable distributed rate limiting:
//   1. Create a free Upstash Redis instance at https://console.upstash.com
//   2. Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to:
//      - .env.local (for local dev)
//      - Vercel Environment Variables (for production)
//   3. npm install @upstash/ratelimit @upstash/redis

const DEFAULT_LIMIT = 10;
const WINDOW_SECS = 60;

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
}

// ---------------------------------------------------------------------------
// Upstash distributed rate limiter (production)
// ---------------------------------------------------------------------------

let upstashLimiter: any = null;
let upstashInitAttempted = false;

async function getUpstashLimiter() {
  if (upstashInitAttempted) return upstashLimiter;
  upstashInitAttempted = true;

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  try {
    // Dynamic imports so the app doesn't crash if packages aren't installed
    // @ts-ignore — optional dependency, only available in production with Upstash configured
    const { Ratelimit } = await import("@upstash/ratelimit");
    // @ts-ignore — optional dependency
    const { Redis } = await import("@upstash/redis");

    upstashLimiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(DEFAULT_LIMIT, `${WINDOW_SECS}s`),
      analytics: true,
      prefix: "bidshield:ratelimit",
    });
    console.info("[rate-limit] Using Upstash Redis distributed rate limiter");
    return upstashLimiter;
  } catch (err) {
    console.warn("[rate-limit] Upstash packages not available, falling back to in-memory:", err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// In-memory fallback (development / single-instance)
// ---------------------------------------------------------------------------

const localCache = new LRUCache<string, number[]>({
  max: 500,
  ttl: 1000 * 60, // 1-minute window
});

function checkLocalRateLimit(userId: string, limit = DEFAULT_LIMIT): RateLimitResult {
  const now = Date.now();
  const windowMs = WINDOW_SECS * 1000;

  const timestamps = localCache.get(userId) ?? [];
  const recent = timestamps.filter((t) => now - t < windowMs);

  if (recent.length >= limit) {
    return { allowed: false, limit, remaining: 0 };
  }

  localCache.set(userId, [...recent, now]);
  return { allowed: true, limit, remaining: limit - recent.length - 1 };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns an object describing whether the request is allowed and how many
 * calls remain in the current window.
 *
 * Uses Upstash Redis in production (when env vars are set) for true distributed
 * rate limiting across all serverless instances. Falls back to in-memory LRU
 * when Upstash is not configured.
 *
 * Default: 10 AI calls per 60-second sliding window per user.
 */
export async function checkRateLimit(userId: string, limit = DEFAULT_LIMIT): Promise<RateLimitResult> {
  const limiter = await getUpstashLimiter();

  if (limiter) {
    try {
      const result = await limiter.limit(userId);
      return {
        allowed: result.success,
        limit: result.limit,
        remaining: result.remaining,
      };
    } catch (err) {
      // If Upstash fails, fall back to local limiter rather than blocking all requests
      console.warn("[rate-limit] Upstash error, falling back to local:", err);
    }
  }

  return checkLocalRateLimit(userId, limit);
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
