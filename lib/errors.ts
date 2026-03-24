/**
 * Machine-readable error codes for all API responses (L5).
 *
 * Include `code` alongside `error` in every error JSON response so that
 * frontend code can distinguish error types without fragile string matching:
 *
 *   return NextResponse.json(
 *     { error: "Subscription required", code: ErrorCode.SUBSCRIPTION_REQUIRED },
 *     { status: 403 }
 *   );
 *
 * Frontend usage:
 *   if (data.code === ErrorCode.SUBSCRIPTION_REQUIRED) showUpgradeModal();
 */
export const ErrorCode = {
  // Auth
  UNAUTHORIZED: "UNAUTHORIZED",               // 401 — not signed in
  FORBIDDEN: "FORBIDDEN",                     // 403 — signed in but not allowed

  // Subscription / entitlements
  SUBSCRIPTION_REQUIRED: "SUBSCRIPTION_REQUIRED", // 403 — feature requires paid plan
  DEMO_ONLY: "DEMO_ONLY",                     // 403 — action not available in demo mode

  // Input validation
  INVALID_INPUT: "INVALID_INPUT",             // 400 — schema / format mismatch
  FILE_TOO_LARGE: "FILE_TOO_LARGE",           // 413 — upload exceeds 20 MB
  UNSUPPORTED_FILE_TYPE: "UNSUPPORTED_FILE_TYPE", // 415 — not a supported MIME type

  // Rate limiting
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED", // 429 — too many requests

  // AI / extraction
  EXTRACTION_FAILED: "EXTRACTION_FAILED",     // 422 — AI response could not be parsed
  AI_TIMEOUT: "AI_TIMEOUT",                   // 504 — Anthropic API timed out

  // Webhooks
  INVALID_SIGNATURE: "INVALID_SIGNATURE",     // 400 — webhook HMAC mismatch
  WEBHOOK_DUPLICATE: "WEBHOOK_DUPLICATE",     // 200 — already processed (idempotent skip)

  // Server
  INTERNAL_ERROR: "INTERNAL_ERROR",           // 500 — unexpected server error
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
