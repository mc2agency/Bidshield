import { LRUCache } from "lru-cache";
import { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";

// P0-5: Distributed rate limiting — three-tier strategy:
//
// Tier 1 (distributed): Convex — uses the rateLimits table.
//   Works across all Vercel instances. Requires NEXT_PUBLIC_CONVEX_URL env var.
//
// Tier 2 (local fallback): In-memory LRU — single-instance only.
//   Used in development or if Convex is unreachable.

const DEFAULT_LIMIT = 10;
const WINDOW_SECS = 60;

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
}

// ---------------------------------------------------------------------------
// Upstash tier removed — packages not installed.
// Tier 1 is Convex distributed store; Tier 2 is in-memory LRU.
// ---------------------------------------------------------------------------

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
 *  1. Convex rateLimits table — distributed, works across all Vercel instances.
 *  2. In-memory LRU — single-instance fallback (dev / Convex unreachable).
 *
 * Default: 10 AI calls per 60-second sliding window per user.
 */
export async function checkRateLimit(
  userId: string,
  action = "ai_endpoint",
  limit = DEFAULT_LIMIT
): Promise<RateLimitResult> {
  // Tier 1: Convex distributed store
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (convexUrl) {
    try {
      const convex = new ConvexHttpClient(convexUrl);
      const result = await convex.mutation(anyApi.rateLimits.recordAndCheck, {
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
