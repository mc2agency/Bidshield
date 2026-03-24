import { internalAction } from "./_generated/server";
import { v } from "convex/values";

const FROM = "BidShield <hello@bidshield.co>";
const DASHBOARD_URL = "https://www.bidshield.co/bidshield/dashboard";
const PRICING_URL = "https://www.bidshield.co/bidshield/pricing";

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
  body { margin: 0; padding: 0; background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  .wrap { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
  .header { background: #059669; padding: 24px 32px; }
  .header-logo { color: #ffffff; font-size: 18px; font-weight: 700; letter-spacing: -0.3px; }
  .body { padding: 32px; color: #1e293b; font-size: 15px; line-height: 1.6; }
  .body h2 { font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 16px; }
  .body p { margin: 0 0 16px; color: #334155; }
  .cta { display: inline-block; background: #059669; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 8px 0 16px; }
  .callout { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px 20px; margin: 20px 0; }
  .callout p { margin: 0; color: #166534; font-size: 14px; }
  table.compare { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; }
  table.compare th { background: #f1f5f9; padding: 10px 14px; text-align: left; font-weight: 600; color: #475569; }
  table.compare td { padding: 10px 14px; border-top: 1px solid #e2e8f0; color: #334155; }
  .footer { padding: 20px 32px; border-top: 1px solid #e2e8f0; }
  .footer p { font-size: 12px; color: #94a3b8; margin: 0; }
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <div class="header-logo">🛡️ BidShield</div>
  </div>
  <div class="body">
    ${content}
  </div>
  <div class="footer">
    <p>BidShield &middot; <a href="https://www.bidshield.co" style="color:#94a3b8;">bidshield.co</a></p>
    <p style="margin-top:6px;">You're receiving this because you created a BidShield account.</p>
  </div>
</div>
</body>
</html>`;
}

function getEmailContent(day: number, firstName: string): { subject: string; html: string } {
  switch (day) {
    case 1:
      return {
        subject: "Your BidShield account is ready",
        html: emailWrapper(`
          <h2>Welcome to BidShield, ${firstName}</h2>
          <p>You now have access to the pre-submission bid review system built for commercial roofing estimators.</p>
          <p>Your free account includes:</p>
          <ul style="margin:0 0 16px;padding-left:20px;color:#334155;">
            <li>1 active project</li>
            <li>18-phase bid checklist</li>
            <li>Takeoff reconciliation tool</li>
            <li>Bid readiness score</li>
            <li>Scope gap checker (40 items)</li>
          </ul>
          <p><strong>Start your first bid review:</strong></p>
          <a href="${DASHBOARD_URL}" class="cta">Open Dashboard</a>
          <div class="callout">
            <p><strong>Works alongside your existing tools.</strong> BidShield doesn't replace The EDGE, STACK, or Excel — it reviews the completed bid for the mistakes those tools can't catch.</p>
          </div>
          <p>If you have questions, reply to this email. I read every one.</p>
          <p style="color:#475569;">— Carlos, MC2 Estimating</p>
        `),
      };

    case 3:
      return {
        subject: "The $47K mistake that almost didn't get caught",
        html: emailWrapper(`
          <h2>A story about a $47K scope gap</h2>
          <p>Hi ${firstName},</p>
          <p>This is a real bid. A $3.2M TPO re-roof on a 6-story office complex. The takeoff was clean. The labor was priced right. The material quantities matched the drawings.</p>
          <p>What got missed: <strong>14 mechanical curb units on the roof plan that weren't on the specification sheet.</strong></p>
          <p>The estimator used the spec sheet as the scope. The GC's scope included the mechanical drawings. At the pre-bid meeting, nobody asked about curb flashings.</p>
          <p>That gap — 14 curbs × $3,400 each — was $47,600 of unpriced work. The company won the bid at $3.2M. The actual cost came in at $3.247M.</p>
          <div class="callout">
            <p>BidShield's Phase 5 (Mechanical Systems Review) specifically checks: <em>"Have all rooftop mechanical units been counted and matched against both the architectural and mechanical drawings?"</em></p>
          </div>
          <p>That one check. That's what BidShield is for.</p>
          <p>If you haven't run a bid through the checklist yet, start with one you're working on now:</p>
          <a href="${DASHBOARD_URL}" class="cta">Run a Bid Review</a>
          <p style="color:#475569;">— Carlos</p>
        `),
      };

    case 5:
      return {
        subject: "How BidShield's 18-phase review works",
        html: emailWrapper(`
          <h2>The 18-phase pre-submission review</h2>
          <p>Hi ${firstName},</p>
          <p>Here's what BidShield checks before you submit a bid. Each phase catches a different category of mistake:</p>
          <table class="compare">
            <tr><th>Phase</th><th>What It Checks</th></tr>
            <tr><td>1 — Scope Verification</td><td>Addenda reviewed, scope documents match</td></tr>
            <tr><td>2 — Takeoff Reconciliation</td><td>Quantities match drawings, no areas missed</td></tr>
            <tr><td>3 — Material Pricing</td><td>Prices current, escalation accounted for</td></tr>
            <tr><td>4 — Labor Verification</td><td>Crew size, production rates, access conditions</td></tr>
            <tr><td>5 — Mechanical Systems</td><td>Curb count, equipment on drawings vs. specs</td></tr>
            <tr><td>6 — Submittal Requirements</td><td>Product submittals listed, lead times checked</td></tr>
            <tr><td>7 — Warranty Scope</td><td>Manufacturer requirements, labor warranty</td></tr>
            <tr><td>8 — Bid Form Review</td><td>Alternates, unit prices, required attachments</td></tr>
          </table>
          <p>...plus 10 more phases covering safety, liquidated damages, bonding, schedule, exclusions, and final numbers.</p>
          <p>Each phase has 5–8 specific checklist items. When you mark them complete, your Bid Readiness Score updates in real time.</p>
          <a href="${DASHBOARD_URL}" class="cta">Open Your Dashboard</a>
          <p style="color:#475569;">— Carlos</p>
        `),
      };

    case 8:
      return {
        subject: "Manual checklist vs. BidShield — an honest comparison",
        html: emailWrapper(`
          <h2>Your Excel checklist vs. BidShield</h2>
          <p>Hi ${firstName},</p>
          <p>Most estimators already have some version of a pre-submission checklist. Here's how BidShield compares to doing it manually:</p>
          <table class="compare">
            <tr><th></th><th>Manual / Excel</th><th>BidShield</th></tr>
            <tr><td><strong>Consistency</strong></td><td>Varies by estimator</td><td>Same 18 phases every bid</td></tr>
            <tr><td><strong>Coverage</strong></td><td>What you remember</td><td>100+ check items, always</td></tr>
            <tr><td><strong>Time</strong></td><td>20–45 min if you do it</td><td>12–18 min with scoring</td></tr>
            <tr><td><strong>Takeoff verify</strong></td><td>Manual cross-reference</td><td>SF auto-reconciliation</td></tr>
            <tr><td><strong>Bid score</strong></td><td>None — gut feel</td><td>0–100 readiness score</td></tr>
            <tr><td><strong>Export</strong></td><td>None or manual PDF</td><td>PDF bid package (Pro)</td></tr>
            <tr><td><strong>Analytics</strong></td><td>None</td><td>Win/loss + $/SF trends (Pro)</td></tr>
          </table>
          <p>The biggest difference isn't features — it's that BidShield makes you actually do the review. The manual checklist gets skipped when you're busy. BidShield is in the browser, tied to the bid, with a score that tells you when you're done.</p>
          <a href="${DASHBOARD_URL}" class="cta">Open Your Dashboard</a>
          <p style="color:#475569;">— Carlos</p>
        `),
      };

    case 12:
      return {
        subject: "14-day free trial — no card required",
        html: emailWrapper(`
          <h2>Full Pro access, free for 14 days</h2>
          <p>Hi ${firstName},</p>
          <p>Your free account has 1 active project. If you're bidding more than that — or if you want to unlock the features below — the 14-day trial gives you full Pro access with no credit card required:</p>
          <ul style="margin:0 0 16px;padding-left:20px;color:#334155;">
            <li><strong>Unlimited projects</strong></li>
            <li>PDF bid package export</li>
            <li>Win/loss analytics &amp; $/SF benchmarks</li>
            <li>Material price book (saved prices)</li>
            <li>Quote expiration alerts</li>
            <li>GC relationship tracking</li>
            <li>All 8 Excel estimating templates</li>
          </ul>
          <div class="callout">
            <p>One prevented scope gap on a $2M bid pays for <strong>16+ years</strong> of BidShield Pro at $149/month.</p>
          </div>
          <a href="${PRICING_URL}" class="cta">Start 14-Day Free Trial — No Card Required</a>
          <p>Cancel anytime. Your data stays accessible until the end of your billing period.</p>
          <p style="color:#475569;">— Carlos</p>
        `),
      };

    default:
      throw new Error(`Unknown onboarding day: ${day}`);
  }
}

export const sendOnboardingEmail = internalAction({
  args: {
    email: v.string(),
    name: v.string(),
    day: v.number(),
  },
  handler: async (_ctx, { email, name, day }) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("RESEND_API_KEY not set — skipping onboarding email day", day);
      return;
    }

    const firstName = name.split(" ")[0] || "there";
    const { subject, html } = getEmailContent(day, firstName);

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from: FROM, to: email, subject, html }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error(`Resend error sending day ${day} email to ${email}:`, text);
      } else {
        }
    } catch (err) {
      console.error(`Failed to send day ${day} onboarding email to ${email}:`, err);
    }
  },
});
