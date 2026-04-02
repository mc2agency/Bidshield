import { LRUCache } from "lru-cache";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

// P0-5: Distributed rate limiting — three-tier strategy:
//
// Tier 1 (fastest): Upstash Redis — true distributed sliding window.
//   Requires UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN env vars.
//   To enable: npm install @upstash/ratelimit @upstash/redis
//
// Tier 2 (distributed fallback): Convex — uses the rateLimits table.
//   Works without Upstash, accurate across all Vercel instances.
//   Requires NEXT_PUBLIC_CONVEX_URL env var (already required by the app).
//
// Tier 3 (local fallback): In-memory LRU — single-instance only.
//   Used in development or if Convex is unreachable.

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
 * Priority:
 *  1. Upstash Redis (when env vars set) — true distributed sliding window.
 *  2. Convex rateLimits table — distributed, works without Upstash.
 *  3. In-memory LRU — single-instance fallback (dev / Convex unreachable).
 *
 * Default: 10 AI calls per 60-second sliding window per user.
 */
export async function checkRateLimit(
  userId: string,
  action = "ai_endpoint",
  limit = DEFAULT_LIMIT
): Promise<RateLimitResult> {
  // Tier 1: Upstash
  const limiter = await getUpstashLimiter();
  if (limiter) {
    try {
      const result = await limiter.limit(`${userId}:${action}`);
      return {
        allowed: result.success,
        limit: result.limit,
        remaining: result.remaining,
      };
    } catch (err) {
      console.warn("[rate-limit] Upstash error, falling back to Convex:", err);
    }
  }

  // Tier 2: Convex distributed store
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (convexUrl) {
    try {
      const convex = new ConvexHttpClient(convexUrl);
      const result = await convex.mutation(api.rateLimits.recordAndCheck, {
        userId,
        action,
        limit,
        windowMs: WINDOW_SECS * 1000,
      });
      return {
        allowed: result.allowed,
        limit: result.limit,
        remaining: Math.max(0, result.limit - result.count),
      };
    } catch (err) {
      console.warn("[rate-limit] Convex error, falling back to local LRU:", err);
    }
  }

  // Tier 3: local LRU fallback
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
