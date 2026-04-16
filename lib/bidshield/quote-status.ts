// Shared quote freshness helpers. Used by both bidScore.ts (Validator) and the
// Materials tab UI so the "valid / expiring / expired / stale" classification
// stays consistent everywhere in the app.
//
// The Validator treats a material as having stale pricing if its linked quote
// is expired, expiring within 14 days, or >90 days old with no expiration.

export type QuoteFreshness =
  | "valid"        // has an expirationDate in the future (>14d out) or quoteDate within 90 days
  | "expiring"     // expirationDate within the next 14 days
  | "expired"      // expirationDate in the past, or explicitly marked expired
  | "stale"        // quoteDate >90 days old with no expirationDate
  | "unknown";     // no dates on file

const DAY_MS = 1000 * 60 * 60 * 24;
const EXPIRING_WINDOW_DAYS = 14;
const STALE_AGE_DAYS = 90;

export interface QuoteLike {
  status?: string;
  quoteDate?: string;
  expirationDate?: string;
}

/**
 * Classify a single quote's freshness. Prefers expirationDate when present,
 * otherwise falls back to quoteDate age. Matches the rules already used in
 * bidScore.ts quote section and MaterialsTab.isStaleQuote().
 */
export function getQuoteFreshness(
  quote: QuoteLike | null | undefined,
  now: number = Date.now()
): QuoteFreshness {
  if (!quote) return "unknown";

  // Explicit status wins
  if (quote.status === "expired") return "expired";

  if (quote.expirationDate) {
    const exp = new Date(quote.expirationDate).getTime();
    if (!isNaN(exp)) {
      const daysLeft = Math.ceil((exp - now) / DAY_MS);
      if (daysLeft < 0) return "expired";
      if (daysLeft <= EXPIRING_WINDOW_DAYS) return "expiring";
      return "valid";
    }
  }

  if (quote.quoteDate) {
    const qd = new Date(quote.quoteDate).getTime();
    if (!isNaN(qd)) {
      const ageDays = Math.floor((now - qd) / DAY_MS);
      if (ageDays > STALE_AGE_DAYS) return "stale";
      return "valid";
    }
  }

  return "unknown";
}

/**
 * True if a quote's pricing should NOT be trusted for a final bid.
 */
export function isStaleOrExpired(
  quote: QuoteLike | null | undefined,
  now: number = Date.now()
): boolean {
  const f = getQuoteFreshness(quote, now);
  return f === "expired" || f === "expiring" || f === "stale";
}
