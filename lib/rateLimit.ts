import { LRUCache } from "lru-cache";

// NOTE: This in-memory rate limiter works correctly within a single serverless
// function instance. On Vercel, each warm instance maintains its own counter,
// so a user hitting N concurrent cold instances could exceed the limit by up to
// N×. For a truly distributed rate limit, set UPSTASH_REDIS_REST_URL and
// UPSTASH_REDIS_REST_TOKEN in your environment and install @upstash/ratelimit.
// The primary guard on every AI endpoint is Clerk authentication — an
// unauthenticated caller cannot reach this check at all.

const ratelimit = new LRUCache<string, number[]>({
  max: 500,
  ttl: 1000 * 60, // 1-minute window
});

/**
 * Returns true if the request is allowed, false if rate-limited.
 * Default: 10 AI calls per minute per user (per function instance).
 */
export function checkRateLimit(userId: string, limit = 10): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000;

  const timestamps = ratelimit.get(userId) ?? [];
  const recent = timestamps.filter((t) => now - t < windowMs);

  if (recent.length >= limit) return false;

  ratelimit.set(userId, [...recent, now]);
  return true;
}
