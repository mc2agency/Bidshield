import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// L-15: Check for expiring quotes every 6 hours
crons.interval(
  "check-quote-expirations",
  { hours: 6 },
  // @ts-ignore TS2589: Convex internal API generics hit type-depth limit with Zod v4
  internal.bidshield.checkQuoteExpirations
);

// L-15: Check for bids due within 48 hours every 4 hours
crons.interval(
  "check-bid-deadlines",
  { hours: 4 },
  // @ts-ignore TS2589: Convex internal API generics hit type-depth limit with Zod v4
  internal.bidshield.checkBidDeadlines
);

// GC-1: Purge stale rate-limit rows every hour.
// Rows older than 1 hour are beyond any sliding window and can be safely deleted.
// Without this, the rateLimits table grows unboundedly and the by_user_action_time
// index slows down proportionally.
crons.interval(
  "purge-rate-limits",
  { hours: 1 },
  // @ts-ignore TS2589: Convex internal API generics hit type-depth limit with Zod v4
  internal.rateLimits.purgeStaleRateLimits
);

// GC-2: Purge AI usage rows older than 90 days.
// The 30-day rolling window used by getMonthlyUsage only needs ~90 days of history.
crons.interval(
  "purge-ai-usage",
  { hours: 24 },
  // @ts-ignore TS2589: Convex internal API generics hit type-depth limit with Zod v4
  internal.bidshield.aiUsage.purgeOldAiUsage
);

// GC-3: Purge processed webhook records older than 14 days.
// Stripe retries happen within 3 days; 14 days provides ample dedup coverage
// while preventing unbounded growth of the processedWebhooks table.
crons.interval(
  "purge-processed-webhooks",
  { hours: 24 },
  // @ts-ignore TS2589: Convex internal API generics hit type-depth limit with Zod v4
  internal.webhooks.purgeOldProcessedWebhooks
);

export default crons;
