import { LRUCache } from "lru-cache";

const ratelimit = new LRUCache<string, number[]>({
  max: 500,
  ttl: 1000 * 60, // 1-minute window
});

/**
 * Returns true if the request is allowed, false if rate-limited.
 * Default: 10 AI calls per minute per user.
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
