# BidShield Feature Roadmap — Implementation Plan

> **Reminder:** BidShield is a **bid QA and workflow platform** for commercial roofing estimators — NOT an estimating app. Every feature below is workflow, compliance, document intelligence, or decision support. Do not add estimating math.

**Goal:** Implement 12 high-value features across 4 priority tiers to transform BidShield from a checklist tool into a full AI-powered bid intelligence platform.

**Architecture:** All features follow the same pattern: Convex schema → Convex mutations/queries → Next.js API route (Haiku for simple text, Sonnet for complex document parsing) → React tab or component wired with `useProGate`. No new dependencies needed — stack is already: Next.js 15, Convex, Clerk, Anthropic SDK, Zod, Tailwind.

**Tech Stack:** Next.js 15 App Router, Convex (DB + serverless), Clerk (auth), Anthropic SDK, Zod, Tailwind/CSS vars (`--bs-*`), existing `useProGate` + `requireProSubscription` patterns.

**Commit after every task. Run `git push` after every feature group.**

---

## Feature Groups

- **Group A** — Addenda Intelligence (P1)
- **Group B** — Sub Quote Tracker + Expiry Alerts (P1)
- **Group C** — AI Exclusions Generator v2 (P1)
- **Group D** — Go/No-Go Bid Screener (P2)
- **Group E** — Win Rate Intelligence Dashboard (P2)
- **Group F** — AI Peer Review Simulator (P2)
- **Group G** — Prevailing Wage Compliance Flag (P2)
- **Group H** — Multi-Estimator Collaboration — Phase Ownership (P3)
- **Group I** — Smart Checklist Branching by Project Type (P3)
- **Group J** — Submission Audit Trail (P3) — *schema already exists (`bidshield_submissions`)*
- **Group K** — Scope Narrative Auto-Draft (P3)
- **Group L** — Historical Scope Gap Intelligence (P3)

---

## Convention Reference

Every AI route follows this skeleton (copy from `check-addendum-impact/route.ts`):
```ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rateLimit";
import { requireProSubscription } from "@/lib/requireProSubscription";
import { z } from "zod";
import anthropic from "@/lib/anthropic"; // shared singleton

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rl = await checkRateLimit(userId);
  if (!rl.allowed) return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429, headers: rateLimitHeaders(rl) });
  const proGuard = await requireProSubscription(userId);
  if (proGuard) return proGuard;
  // ... Zod parse, AI call, Zod output validate, return
}
```

Models:
- `claude-haiku-4-5-20251001` — all text/analysis routes
- `claude-sonnet-4-5-20251001` — only PDF base64 parsing routes

Every new tab component:
```tsx
const { proGateModal, guardedFetch } = useProGate();
// ... replace fetch → guardedFetch, render {proGateModal} in JSX root
```

CSS: Always use `var(--bs-*)` design tokens, never hardcode colors.

---

## GROUP A — Addenda Intelligence

**What it does:** When an addendum PDF is uploaded in AddendaTab, AI parses it and tells the estimator *which of the 18 checklist phases need re-review* and *what specifically changed*. Currently the addendum only stores text notes — this makes it active.

**Existing schema:** `bidshield_addenda` already has `scopeImpact`, `impactCategories`, `reviewStatus` fields. Add `phasesAffected` (array of phase keys).

---

### A-1: Schema — add `phasesAffected` to `bidshield_addenda`

**Files:**
- Modify: `convex/schema.ts` — inside `bidshield_addenda` table

**Step 1:** Add field after `impactCategories`:
```ts
phasesAffected: v.optional(v.array(v.string())), // ["phase9","phase11","phase14"]
aiAnalysisSummary: v.optional(v.string()), // one-sentence AI summary of changes
```

**Step 2:** Commit
```bash
git add convex/schema.ts
git commit -m "schema: add phasesAffected + aiAnalysisSummary to bidshield_addenda"
```

---

### A-2: AI route — `analyze-addendum`

**Files:**
- Create: `app/api/bidshield/analyze-addendum/route.ts`

**What it does:** Takes `{ addendumText: string, projectSystemType?: string }`, returns `{ phasesAffected: string[], impacts: { phaseKey: string, phaseName: string, action: string }[], summary: string }`.

**The 18 phase keys to reference in the prompt:**
phase1=Project Setup, phase2=Plans & Drawings Review, phase3=Structural Review, phase4=Mechanical Review, phase5=Plumbing Review, phase6=Electrical Review, phase7=Civil/Site/DOT Review, phase8=Pre-Bid Meeting, phase9=Specification Review, phase10=Addenda Review, phase11=Takeoff – Areas, phase12=Takeoff – Linear & Count, phase13=Takeoff Reconciliation, phase14=Material Pricing, phase15=Labor Pricing, phase16=Subcontractor Scope, phase17=Bid Qualifications & Compliance, phase18=Pre-Submission & Final Validation

```ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rateLimit";
import { requireProSubscription } from "@/lib/requireProSubscription";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const InputSchema = z.object({
  addendumText: z.string().min(1).max(8000).trim(),
  projectSystemType: z.string().max(50).optional(),
});

const PhaseImpactSchema = z.object({
  phaseKey: z.string(),
  phaseName: z.string(),
  action: z.string().max(300),
});

const OutputSchema = z.object({
  phasesAffected: z.array(z.string()),
  impacts: z.array(PhaseImpactSchema),
  summary: z.string().max(300),
});

const PHASE_MAP = `phase1=Project Setup, phase2=Plans & Drawings Review, phase3=Structural Review, phase4=Mechanical Review, phase5=Plumbing Review, phase6=Electrical Review, phase7=Civil/Site/DOT Review, phase8=Pre-Bid Meeting, phase9=Specification Review, phase10=Addenda Review, phase11=Takeoff – Areas, phase12=Takeoff – Linear & Count, phase13=Takeoff Reconciliation, phase14=Material Pricing, phase15=Labor Pricing, phase16=Subcontractor Scope, phase17=Bid Qualifications & Compliance, phase18=Pre-Submission & Final Validation`;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rl = await checkRateLimit(userId);
  if (!rl.allowed) return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429, headers: rateLimitHeaders(rl) });
  const proGuard = await requireProSubscription(userId);
  if (proGuard) return proGuard;

  const parsed = InputSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { addendumText, projectSystemType } = parsed.data;

  const systemCtx = projectSystemType ? ` The roof system type is ${projectSystemType}.` : "";

  const prompt = `You are a commercial roofing estimator reviewing an addendum to a bid.${systemCtx}

Addendum content:
"""
${addendumText}
"""

Phase map: ${PHASE_MAP}

Identify which bid phases are affected and what the estimator must re-review or reprice. Return ONLY valid JSON in this exact shape:
{
  "phasesAffected": ["phase9","phase14"],
  "impacts": [
    { "phaseKey": "phase9", "phaseName": "Specification Review", "action": "Re-read Division 07 section 3.2 — membrane overlap changed from 3in to 6in." }
  ],
  "summary": "Membrane overlap requirement doubled; re-check material quantity and spec compliance."
}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  let message: Awaited<ReturnType<typeof client.messages.create>>;
  try {
    message = await client.messages.create(
      { model: "claude-haiku-4-5-20251001", max_tokens: 1024, messages: [{ role: "user", content: prompt }] },
      { signal: controller.signal }
    );
  } finally { clearTimeout(timeout); }

  const raw = message.content[0].type === "text" ? message.content[0].text : "";
  let parsed2: any;
  try { parsed2 = JSON.parse(raw); } catch {
    return NextResponse.json({ error: "AI returned unreadable response." }, { status: 422 });
  }
  const validated = OutputSchema.safeParse(parsed2);
  if (!validated.success) return NextResponse.json({ error: "AI response shape invalid." }, { status: 422 });

  return NextResponse.json(validated.data);
}
```

**Commit:**
```bash
git add app/api/bidshield/analyze-addendum/route.ts
git commit -m "feat: add analyze-addendum AI route"
```

---

### A-3: Convex mutation — `updateAddendumAnalysis`

**Files:**
- Modify: `convex/bidshield.ts` (or wherever addenda mutations live — grep for `updateAddendum`)

**Add mutation:**
```ts
export const updateAddendumAnalysis = mutation({
  args: {
    addendumId: v.id("bidshield_addenda"),
    phasesAffected: v.array(v.string()),
    aiAnalysisSummary: v.string(),
  },
  handler: async (ctx, { addendumId, phasesAffected, aiAnalysisSummary }) => {
    await ctx.db.patch(addendumId, { phasesAffected, aiAnalysisSummary, updatedAt: Date.now() });
  },
});
```

**Commit:**
```bash
git commit -m "feat: add updateAddendumAnalysis Convex mutation"
```

---

### A-4: UI — AddendaTab "Analyze with AI" button

**Files:**
- Modify: `app/bidshield/dashboard/project/tabs/AddendaTab.tsx`

**What to add:**
1. In each addendum card that has `title` + `notes`, add an "🔍 Analyze Impact" button next to the existing "Check Impact" button.
2. On click: call `guardedFetch("/api/bidshield/analyze-addendum", { method: "POST", body: JSON.stringify({ addendumText: [add.title, add.notes].filter(Boolean).join(". "), projectSystemType: project?.systemType }) })`.
3. On success: call `updateAddendumAnalysis` mutation to persist, then display a colored card showing `summary` + a list of `impacts` (phaseKey badge + action text).
4. If `phasesAffected` length > 0, show a yellow warning badge on the addendum card: "⚠️ {n} phases need re-review".

**Pattern — loading/result state per addendum:**
```tsx
const [analysisLoading, setAnalysisLoading] = useState<string | null>(null); // addendumId
const [analysisResults, setAnalysisResults] = useState<Record<string, any>>({}); // addendumId → result
```

**Commit:**
```bash
git commit -m "feat: AddendaTab — AI phase impact analyzer with persist"
```

---

## GROUP B — Sub Quote Tracker + Expiry Alerts

**What it does:** The existing `bidshield_quotes` table already has `expirationDate` and `status`. This feature adds: (1) a cron that auto-transitions status to `expiring`/`expired`, (2) notifications when quotes expire before bid date, (3) a `SubQuotePanel` component in QuotesTab that shows expiry status clearly, (4) an alert in the OverviewTab/dashboard if any active bid has expiring quotes.

---

### B-1: Cron — auto-transition quote expiry status

**Files:**
- Modify: `convex/crons.ts`
- Modify: `convex/bidshield.ts` (add `processQuoteExpiryTransitions` mutation)

**Add mutation:**
```ts
export const processQuoteExpiryTransitions = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const warningMs = 3 * 24 * 60 * 60 * 1000; // 3 days
    // Get all quotes with expirationDate and status in ["requested","received","valid"]
    // For each: if expDate < now → "expired"; if expDate < now+3days → "expiring"
    // Note: Convex doesn't support complex queries across all users — use a paginated scan
    // Fetch up to 200 quotes per run (quotes are small, this is fine)
    const quotes = await ctx.db.query("bidshield_quotes")
      .filter(q => q.neq(q.field("expirationDate"), undefined))
      .take(200);
    for (const quote of quotes) {
      if (!quote.expirationDate) continue;
      const expMs = new Date(quote.expirationDate).getTime();
      if (isNaN(expMs)) continue;
      const currentStatus = quote.status;
      let newStatus: typeof currentStatus | null = null;
      if (expMs < now && currentStatus !== "expired") newStatus = "expired";
      else if (expMs < now + warningMs && expMs >= now && currentStatus === "valid") newStatus = "expiring";
      if (newStatus) await ctx.db.patch(quote._id, { status: newStatus, updatedAt: Date.now() });
    }
  },
});
```

**Add to crons.ts:**
```ts
crons.interval("expire-quotes", { hours: 6 }, internal.bidshield.processQuoteExpiryTransitions);
```

**Commit:**
```bash
git commit -m "feat: cron — auto-transition quote expiry status (valid→expiring→expired)"
```

---

### B-2: Cron — notify on expiry when bid deadline is near

**Files:**
- Modify: `convex/bidshield.ts` (add `notifyExpiringQuotesNearBidDate` mutation)

**What it does:** For each project with `status="in_progress"` and `bidDate` within 7 days, find linked quotes with `status="expiring"` or `status="expired"`. Create a `bidshield_notifications` row per quote (type=`"quote_expiring"`) if not already notified in the last 24h.

```ts
export const notifyExpiringQuotesNearBidDate = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    const projects = await ctx.db.query("bidshield_projects")
      .filter(q => q.eq(q.field("status"), "in_progress"))
      .take(100);
    for (const project of projects) {
      if (!project.bidDate) continue;
      const bidMs = new Date(project.bidDate).getTime();
      if (isNaN(bidMs) || bidMs - now > sevenDays) continue;
      const quotes = await ctx.db.query("bidshield_quotes")
        .withIndex("by_project", q => q.eq("projectId", project._id))
        .filter(q => q.or(q.eq(q.field("status"), "expiring"), q.eq(q.field("status"), "expired")))
        .collect();
      for (const quote of quotes) {
        // Check if already notified in last 24h
        const recent = await ctx.db.query("bidshield_notifications")
          .withIndex("by_user", q => q.eq("userId", project.userId))
          .filter(q => q.and(
            q.eq(q.field("quoteId"), quote._id),
            q.gt(q.field("createdAt"), now - 86_400_000)
          ))
          .first();
        if (recent) continue;
        const daysLeft = Math.max(0, Math.round((bidMs - now) / 86_400_000));
        const isExpired = quote.status === "expired";
        await ctx.db.insert("bidshield_notifications", {
          userId: project.userId,
          type: "quote_expiring",
          title: isExpired ? `Quote expired — ${quote.vendorName}` : `Quote expiring soon — ${quote.vendorName}`,
          message: isExpired
            ? `Your quote from ${quote.vendorName} has expired. Bid deadline is in ${daysLeft} day${daysLeft === 1 ? "" : "s"}.`
            : `Your quote from ${quote.vendorName} expires ${quote.expirationDate}. Bid deadline is in ${daysLeft} day${daysLeft === 1 ? "" : "s"}.`,
          projectId: project._id,
          quoteId: quote._id,
          read: false,
          createdAt: now,
        });
      }
    }
  },
});
```

Add to crons:
```ts
crons.interval("notify-expiring-quotes", { hours: 12 }, internal.bidshield.notifyExpiringQuotesNearBidDate);
```

**Commit:**
```bash
git commit -m "feat: cron — notify estimator when quotes expire near bid deadline"
```

---

### B-3: UI — Quote expiry status badges in QuotesTab

**Files:**
- Modify: `app/bidshield/dashboard/project/tabs/QuotesTab.tsx`

**What to add:**
1. In each quote row, show a colored status pill: `valid`=green, `expiring`=amber, `expired`=red, others=gray.
2. If `status === "expiring"` or `"expired"`, show expiry date prominently with a warning icon.
3. Add a `expirationDate` field to the existing quote edit form (date picker, same pattern as `quoteDate`).
4. Add a summary banner at the top of QuotesTab if any quotes are `expiring` or `expired`: "⚠️ {n} quote(s) need attention before bid day."

**Commit:**
```bash
git commit -m "feat: QuotesTab — expiry status badges + summary warning banner"
```

---

### B-4: UI — Notification bell in dashboard layout

**Files:**
- Modify: `app/bidshield/dashboard/layout.tsx`
- Create: `components/NotificationBell.tsx`

**NotificationBell.tsx:**
- Reads `bidshield_notifications` via `useQuery(api.bidshield.getUnreadNotifications, { userId })`.
- Shows a bell icon with unread count badge.
- Click opens a dropdown list of recent notifications.
- Each notification has a "Mark read" button → calls `markNotificationRead` mutation.
- Link to the relevant project if `projectId` is set.

**Add Convex queries:**
```ts
// in convex/bidshield.ts
export const getUnreadNotifications = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return ctx.db.query("bidshield_notifications")
      .withIndex("by_user_read", q => q.eq("userId", userId).eq("read", false))
      .order("desc")
      .take(20);
  },
});

export const markNotificationRead = mutation({
  args: { notificationId: v.id("bidshield_notifications") },
  handler: async (ctx, { notificationId }) => {
    await ctx.db.patch(notificationId, { read: true });
  },
});
```

**Commit:**
```bash
git commit -m "feat: notification bell in dashboard with quote expiry alerts"
```

---

## GROUP C — AI Exclusions Generator v2

**What it does:** The current `generate-exclusions` route takes a list and formats it. V2 goes deeper: based on project type, system type, GC name, and the scope items marked `excluded` or `by_others`, AI also *suggests additional exclusions the estimator may have forgotten* based on common patterns for that project type.

---

### C-1: Upgrade `generate-exclusions` route

**Files:**
- Modify: `app/api/bidshield/generate-exclusions/route.ts`

**New input schema** (add optional fields):
```ts
const InputSchema = z.object({
  excludedItems: z.array(z.object({ name: z.string(), note: z.string().optional() })).max(50),
  byOthersItems: z.array(z.object({ name: z.string(), note: z.string().optional() })).max(50),
  clarifications: z.array(z.object({ text: z.string() })).max(30),
  projectType: z.string().max(50).optional(),     // "reroof", "new_construction", "recover", "repair"
  systemType: z.string().max(50).optional(),       // "tpo", "sbs", "epdm", "metal", etc.
  gcName: z.string().max(100).optional(),
  sqft: z.number().positive().optional(),
});
```

**New output schema:**
```ts
const OutputSchema = z.object({
  text: z.string(),               // formatted exclusions text (existing)
  suggestions: z.array(z.object({ // NEW — items to consider adding
    item: z.string(),
    reason: z.string().max(200),
  })).max(8),
});
```

**Updated prompt:** Add a section: "Also suggest up to 5 additional exclusions or clarifications the estimator likely needs for a {systemType} {projectType} project that are NOT already in their list. Return them in the `suggestions` array."

**UI update in ScopeTab:** After generating exclusions, if `suggestions.length > 0`, show a "💡 Suggested additions" section below the text output with one-click "Add to exclusions" buttons.

**Commit:**
```bash
git commit -m "feat: generate-exclusions v2 — AI suggests missing exclusions by project type"
```

---

## GROUP D — Go/No-Go Bid Screener

**What it does:** Before a project enters the 18-phase workflow (or accessible from the dashboard), a quick 5-question screen that gives a Bid / Bid with Caution / Pass recommendation.

---

### D-1: AI route — `go-no-go`

**Files:**
- Create: `app/api/bidshield/go-no-go/route.ts`

**Input schema:**
```ts
const InputSchema = z.object({
  gcName: z.string().max(100),
  projectType: z.string().max(50),
  systemType: z.string().max(50),
  sqft: z.number().positive(),
  bidDeadlineDays: z.number().int().min(0).max(365), // days until deadline
  ownerType: z.enum(["private", "public_federal", "public_state", "public_municipal"]),
  estimatedValue: z.number().positive().optional(),
  notes: z.string().max(500).optional(),
  // Historical context (populated from win/loss log in later feature)
  winRateWithGc: z.number().min(0).max(1).optional(), // 0.0–1.0
  avgDaysToComplete: z.number().optional(),
});
```

**Output schema:**
```ts
const OutputSchema = z.object({
  recommendation: z.enum(["bid", "bid_with_caution", "pass"]),
  confidence: z.enum(["high", "medium", "low"]),
  reasons: z.array(z.string()).max(5),
  redFlags: z.array(z.string()).max(5),
  summary: z.string().max(300),
});
```

**Model:** `claude-haiku-4-5-20251001`

**Prompt strategy:** Give the AI context about what makes a good vs. risky roofing bid (tight deadline = risk, public project = prevailing wage complexity, very small SF with complex system = bad margin, very large SF with simple system = good opportunity). Let it reason and return structured JSON.

**Commit:**
```bash
git commit -m "feat: add go-no-go AI route"
```

---

### D-2: UI — Go/No-Go modal in NewBidWizard

**Files:**
- Modify: `app/bidshield/dashboard/NewBidWizard.tsx`
- Create: `components/GoNoGoResult.tsx`

**What to add:**
1. After the user fills in the basic project info (GC, system type, sqft, bid date) in the wizard, add a "Get Go/No-Go" step before creating the project.
2. Call the API, show the `GoNoGoResult` component (color-coded card: green=Bid, yellow=Caution, red=Pass).
3. Show reasons and red flags.
4. User can still proceed regardless of recommendation (it's advisory).
5. If recommendation is "pass", show a more prominent "Are you sure?" prompt.

**GoNoGoResult.tsx:**
```tsx
interface Props {
  result: { recommendation: string; confidence: string; reasons: string[]; redFlags: string[]; summary: string; };
  onProceed: () => void;
  onCancel: () => void;
}
// Color map: bid=teal, bid_with_caution=amber, pass=red
// Shows summary, reasons list, red flags list, two buttons
```

**Commit:**
```bash
git commit -m "feat: Go/No-Go screener in NewBidWizard"
```

---

## GROUP E — Win Rate Intelligence Dashboard

**What it does:** Simple post-bid outcome tracking that builds a private $/SF and win rate benchmark over time, surfaced in the analytics dashboard.

---

### E-1: Schema — ensure outcome fields exist on `bidshield_projects`

The schema already has: `status` (won/lost/no_award/no_bid), `lossReason`, `competitorName`, `competitorPrice`, `totalBidAmount`, `sqft`. No schema changes needed.

---

### E-2: UI — Bid Outcome Form in OverviewTab

**Files:**
- Modify: `app/bidshield/dashboard/project/tabs/OverviewTab.tsx` or `OverviewTabRedesign.tsx`

**What to add:**
When a project status is `"submitted"`, show a prominent "Record Outcome" card with:
- **Result:** Won / Lost / No Award / No Bid (radio buttons)
- If Lost: **Loss Reason** (dropdown: "Price too high", "Didn't know GC", "Scope mismatch", "Bond/insurance requirement", "Timeline conflict", "Other") + optional note
- If Lost: **Competitor Name** (optional text) + **Competitor Price** (optional number)
- If Won: show a celebratory message + prompt to record actuals later

On submit: call `updateProject` mutation with `status`, `lossReason`, `competitorName`, `competitorPrice`, `completedDate`.

**Commit:**
```bash
git commit -m "feat: bid outcome form in OverviewTab — records win/loss with competitor data"
```

---

### E-3: Analytics — Win Rate Dashboard

**Files:**
- Modify: `app/bidshield/dashboard/analytics/AnalyticsContent.tsx`

**New analytics section:** "Bid Intelligence" — shown only to Pro users.

**Add Convex query:**
```ts
export const getBidIntelligence = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const projects = await ctx.db.query("bidshield_projects")
      .withIndex("by_user", q => q.eq("userId", userId))
      .filter(q => q.neq(q.field("status"), "setup").neq(q.field("status"), "in_progress"))
      .collect();
    // Return raw projects — compute stats client-side
    return projects;
  },
});
```

**Client-side computations in AnalyticsContent.tsx:**
```ts
// From completed projects:
const winRate = won / (won + lost) * 100
const avgBidPerSf = projects.filter(p => p.sqft && p.totalBidAmount).map(p => p.totalBidAmount! / p.sqft!)
const byGc = groupBy(projects, p => p.gc ?? "Unknown")
// winRate per GC, avg $/SF per GC, total bids per GC
```

**UI cards to show:**
1. Overall win rate (big number)
2. Total bids submitted / won / lost
3. Average bid $/SF (with distribution)
4. Win rate by GC (sorted table: GC name | Bids | Wins | Win% | Avg $/SF)
5. Loss reason breakdown (pie or bar)

**Commit:**
```bash
git commit -m "feat: analytics — win rate intelligence dashboard with $/SF by GC"
```

---

## GROUP F — AI Peer Review Simulator

**What it does:** At Phase 18 (Pre-Submission), AI scans the completed checklist state and generates a prioritized "issues to resolve before submitting" list, simulating a senior estimator peer review.

---

### F-1: AI route — `peer-review`

**Files:**
- Create: `app/api/bidshield/peer-review/route.ts`

**Input schema:**
```ts
const InputSchema = z.object({
  // Checklist summary
  totalItems: z.number(),
  doneItems: z.number(),
  pendingItems: z.number(),
  pendingPhases: z.array(z.object({ phaseKey: z.string(), phaseName: z.string(), pendingCount: z.number() })),
  // Addenda state
  addendaCount: z.number(),
  unconfirmedAddenda: z.number(),
  // Quote state
  totalQuotes: z.number(),
  expiredQuotes: z.number(),
  expiringQuotes: z.number(),
  // Project basics
  projectType: z.string().optional(),
  systemType: z.string().optional(),
  bidDate: z.string().optional(),
  bidScore: z.number().optional(),
  // Scope
  unaddressedScopeItems: z.number(),
});
```

**Output schema:**
```ts
const OutputSchema = z.object({
  verdict: z.enum(["ready", "review_needed", "not_ready"]),
  overallRisk: z.enum(["low", "medium", "high", "critical"]),
  issues: z.array(z.object({
    severity: z.enum(["critical", "high", "medium", "low"]),
    title: z.string().max(100),
    detail: z.string().max(300),
  })).max(10),
  summary: z.string().max(400),
});
```

**Commit:**
```bash
git commit -m "feat: add peer-review AI route"
```

---

### F-2: UI — Peer Review panel in ChecklistTab or ValidatorTab

**Files:**
- Modify: `app/bidshield/dashboard/project/tabs/ChecklistTab.tsx`

**What to add:**
1. Add a "🤖 Run AI Peer Review" button near the top of ChecklistTab (visible when bid score > 70, i.e., mostly done).
2. Gathers the required data from existing checklist state, addenda, quotes.
3. Calls `guardedFetch("/api/bidshield/peer-review", ...)`.
4. Shows a result panel:
   - Large verdict badge (Ready / Review Needed / Not Ready) with color.
   - Issues list, sorted by severity (critical first), each with a colored severity pill.
   - Summary text.
5. Issues are actionable — each links to the relevant tab if possible (e.g., "Addendum #2 unconfirmed" links to Addenda tab).

**Commit:**
```bash
git commit -m "feat: AI peer review simulator in ChecklistTab"
```

---

## GROUP G — Prevailing Wage Compliance Flag

**What it does:** In BidQualsTab, when `laborType` is set or owner type is detected as public, AI checks if the project likely requires Davis-Bacon, certified payroll, or state prevailing wage — and flags it with specific action items.

---

### G-1: AI route — `check-labor-compliance`

**Files:**
- Create: `app/api/bidshield/check-labor-compliance/route.ts`

**Input:**
```ts
const InputSchema = z.object({
  laborType: z.enum(["open_shop", "prevailing_wage", "union"]).optional(),
  ownerType: z.enum(["private", "public_federal", "public_state", "public_municipal"]).optional(),
  projectValue: z.number().positive().optional(),
  state: z.string().max(50).optional(),
  certifiedPayrollRequired: z.boolean().optional(),
  bondRequired: z.boolean().optional(),
  mbeGoals: z.boolean().optional(),
});
```

**Output:**
```ts
const OutputSchema = z.object({
  complianceFlags: z.array(z.object({
    type: z.enum(["davis_bacon", "certified_payroll", "prevailing_wage", "apprenticeship_ratio", "mbe_goal", "bond", "insurance"]),
    severity: z.enum(["required", "likely_required", "check_required", "informational"]),
    title: z.string().max(100),
    action: z.string().max(300),
  })).max(8),
  summary: z.string().max(300),
  needsAttention: z.boolean(),
});
```

**Commit:**
```bash
git commit -m "feat: add check-labor-compliance AI route"
```

---

### G-2: UI — Compliance alert in BidQualsTab

**Files:**
- Modify: `app/bidshield/dashboard/project/tabs/BidQualsTab.tsx`

**What to add:**
1. Import `useProGate`.
2. Add "🔍 Check Compliance Requirements" button near the labor type section.
3. On click: call route with form data.
4. Show a colored compliance flags panel:
   - `required` = red pill
   - `likely_required` = orange pill
   - `check_required` = yellow pill
   - `informational` = gray pill
5. If `needsAttention=true`, show a warning banner at the top of the tab.

**Commit:**
```bash
git commit -m "feat: prevailing wage & labor compliance flag in BidQualsTab"
```

---

## GROUP H — Multi-Estimator Collaboration (Phase Ownership)

**What it does:** Allow the project lead to assign checklist phases to team members. Each assigned person sees "my phases" highlighted. The lead sees a team-wide readiness dashboard.

---

### H-1: Schema — `bidshield_phase_assignments`

**Files:**
- Modify: `convex/schema.ts`

```ts
bidshield_phase_assignments: defineTable({
  projectId: v.id("bidshield_projects"),
  ownerId: v.string(),   // Clerk user ID — project lead
  convexUserId: v.optional(v.id("users")),
  phaseKey: v.string(),  // "phase9", "phase14", etc.
  assignedToUserId: v.string(), // Clerk user ID of team member
  assignedToName: v.string(),   // display name
  assignedToEmail: v.string(),
  notes: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_project", ["projectId"])
  .index("by_assignee", ["assignedToUserId"])
  .index("by_project_phase", ["projectId", "phaseKey"]),
```

**Commit:**
```bash
git commit -m "schema: add bidshield_phase_assignments for team collaboration"
```

---

### H-2: Convex CRUD for phase assignments

**Files:**
- Modify: `convex/bidshield.ts`

**Add:**
```ts
export const assignPhase = mutation({ args: { projectId, phaseKey, assignedToUserId, assignedToName, assignedToEmail, notes }, handler: ... });
export const removePhaseAssignment = mutation({ args: { assignmentId }, handler: ... });
export const getPhaseAssignments = query({ args: { projectId }, handler: ... });
```

**Commit:**
```bash
git commit -m "feat: Convex CRUD for phase assignments"
```

---

### H-3: UI — Phase assignment in ChecklistTab

**Files:**
- Modify: `app/bidshield/dashboard/project/tabs/ChecklistTab.tsx`

**What to add:**
1. Each phase header gets an "Assign" button (gear icon, only visible to project owner).
2. Click opens a small inline form: name + email of team member.
3. Assigned phases show an avatar/name chip on the phase header.
4. A "Team View" toggle at the top shows a compact table: Phase | Assigned To | Status (% done) | Last Updated.

**Commit:**
```bash
git commit -m "feat: phase assignment UI in ChecklistTab — team collaboration"
```

---

## GROUP I — Smart Checklist Branching by Project Type

**What it does:** When project type and system type are set (in Setup), certain checklist phases auto-apply `na` status for items that don't apply, and high-risk items get a `warning` flag pre-applied.

---

### I-1: Logic lib — `checklist-branching.ts`

**Files:**
- Create: `lib/bidshield/checklist-branching.ts`

**What it does:** Given `{ projectType, systemType, ownerType, fmGlobal }`, returns a map of `{ itemId: "na" | "warning" }` for items to auto-set.

**Examples:**
- `projectType !== "new_construction"` → structural review items (phase3) that are only relevant for new decks → `na`
- `systemType === "metal"` → certain membrane-specific items → `na`
- `ownerType === "public_federal"` → prevailing wage checklist items → `warning` (needs review)
- `fmGlobal === true` → FM Global insulation minimum R-value item → `warning`

Build this as a data-driven config map, not a big if-else tree.

**Commit:**
```bash
git commit -m "feat: checklist-branching lib — auto-na/warning by project type"
```

---

### I-2: Apply branching when project is created/updated

**Files:**
- Modify: `convex/bidshield.ts` — find `initChecklistItems` mutation (or wherever checklist is initialized)

**What to add:** After initializing checklist items, call branching logic and bulk-update items that should be `na` or `warning`.

**Commit:**
```bash
git commit -m "feat: apply smart branching on checklist init and project type change"
```

---

## GROUP J — Submission Audit Trail (schema already exists)

**What it does:** The `bidshield_submissions` table already exists. This feature builds the UI to display submission records clearly and adds a snapshot of the bid state at submission time.

---

### J-1: UI — Submission record card in SubmissionTab

**Files:**
- Modify: `app/bidshield/dashboard/project/tabs/SubmissionTab.tsx`

**What to add:**
1. Show all past submissions for this project (there could be multiple if bid was revised).
2. Each submission card shows: date/time, method, recipient/portal, confirmation #, bid score at submission, and whether the score threshold was bypassed.
3. Add a "Copy submission record" button that formats the submission info as text for pasting into an email.
4. Show a warning if the project has no submission records but status is `"submitted"`.

**Commit:**
```bash
git commit -m "feat: submission audit trail UI in SubmissionTab"
```

---

## GROUP K — Scope Narrative Auto-Draft

**What it does:** AI generates a professional scope-of-work narrative based on the project's assembly configuration, spec review results, and scope items — the "what we are proposing" section of the bid document.

---

### K-1: AI route — `draft-scope-narrative`

**Files:**
- Create: `app/api/bidshield/draft-scope-narrative/route.ts`

**Input schema:**
```ts
const InputSchema = z.object({
  assemblies: z.array(z.object({
    label: z.string(),
    systemType: z.string(),
    insulationType: z.string().optional(),
    insulationThickness: z.string().optional(),
    rValue: z.number().optional(),
    area: z.number().optional(),
  })).max(10),
  projectType: z.string().optional(),
  systemDescription: z.string().optional(),
  includedScopeItems: z.array(z.string()).max(30),
  excludedScopeItems: z.array(z.string()).max(30),
  clarifications: z.array(z.string()).max(20),
  gcName: z.string().optional(),
  sqft: z.number().optional(),
});
```

**Output:** `{ narrative: string }` — professional paragraph(s) in bid document language.

**Model:** `claude-haiku-4-5-20251001`

**Prompt:** "Write a professional scope-of-work narrative for a commercial roofing bid submission. Use formal bid language. Be concise and specific. Do not include pricing. Cover: what is being installed, excluded, and clarified."

**Commit:**
```bash
git commit -m "feat: add draft-scope-narrative AI route"
```

---

### K-2: UI — Scope Narrative button in ScopeTab

**Files:**
- Modify: `app/bidshield/dashboard/project/tabs/ScopeTab.tsx`

**What to add:**
1. Below the existing exclusions section, add a "📝 Draft Scope Narrative" button.
2. On click: gather assembly data from `project.roofAssemblies`, included/excluded scope items, clarifications.
3. Call `guardedFetch("/api/bidshield/draft-scope-narrative", ...)`.
4. Show the result in a read-only textarea with a "Copy to clipboard" button.
5. Add a "Save to Project" button that stores the narrative in `project.notes` (or a new dedicated field — use `notes` for now with a prefix tag).

**Commit:**
```bash
git commit -m "feat: scope narrative auto-draft in ScopeTab"
```

---

## GROUP L — Historical Scope Gap Intelligence

**What it does:** After 10+ bids, surface which checklist items the user most commonly leaves as `pending` at submission. Show as a "heads up" before submission.

---

### L-1: Convex query — `getUserChecklistPatterns`

**Files:**
- Modify: `convex/bidshield.ts`

```ts
export const getUserChecklistPatterns = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    // Get all checklist items for this user's submitted/won/lost projects
    const items = await ctx.db.query("bidshield_checklist_items")
      .withIndex("by_user_project", q => q.eq("userId", userId))
      .collect();
    // Return raw items — compute patterns client-side
    return items;
  },
});
```

**Commit:**
```bash
git commit -m "feat: getUserChecklistPatterns Convex query"
```

---

### L-2: UI — "Common misses" warning in ValidatorTab

**Files:**
- Modify: `app/bidshield/dashboard/project/tabs/ValidatorTab.tsx`

**What to add:**
1. Load `getUserChecklistPatterns` data.
2. Compute: for each checklist item, what % of past bids was this item still `pending` at submission?
3. In the validator, add a section "📊 Your common blind spots" showing the top 5 items this user historically misses.
4. Only show after 5+ completed bids (not enough data before that).
5. Each item in the list highlights if the current project also has it as `pending`.

**Commit:**
```bash
git commit -m "feat: historical scope gap patterns in ValidatorTab"
```

---

## Final Deployment

After all groups are implemented:

```bash
# 1. Run local TypeScript check
cd /tmp/bidshield && npx tsc --noEmit --skipLibCheck 2>&1 | grep -v node_modules

# 2. Push to GitHub
git push origin main

# 3. Deploy to Vercel (via API)
# Use the existing deployment pattern from previous sessions

# 4. Deploy Convex
npx convex deploy
```

---

## Summary Table

| Group | Feature | Priority | New Routes | Schema Changes | Effort |
|---|---|---|---|---|---|
| A | Addenda Phase Impact Analyzer | P1 | `analyze-addendum` | `phasesAffected` field | Medium |
| B | Sub Quote Expiry + Notifications | P1 | — | — (crons only) | Medium |
| C | Exclusions Generator v2 | P1 | update existing | — | Low |
| D | Go/No-Go Screener | P2 | `go-no-go` | — | Medium |
| E | Win Rate Dashboard | P2 | — | — | Low |
| F | AI Peer Review Simulator | P2 | `peer-review` | — | Medium |
| G | Prevailing Wage Compliance | P2 | `check-labor-compliance` | — | Medium |
| H | Multi-Estimator Collaboration | P3 | — | `bidshield_phase_assignments` | High |
| I | Smart Checklist Branching | P3 | — | — | Medium |
| J | Submission Audit Trail | P3 | — | — (schema exists) | Low |
| K | Scope Narrative Draft | P3 | `draft-scope-narrative` | — | Medium |
| L | Historical Scope Gap Intel | P3 | — | — | Low |
