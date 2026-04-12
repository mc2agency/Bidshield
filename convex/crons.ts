import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// L-15: Check for expiring quotes every 6 hours
crons.interval(
  "check-quote-expirations",
  { hours: 6 },
  internal.bidshield.checkQuoteExpirations
);

// L-15: Check for bids due within 48 hours every 4 hours
crons.interval(
  "check-bid-deadlines",
  { hours: 4 },
  internal.bidshield.checkBidDeadlines
);

export default crons;
