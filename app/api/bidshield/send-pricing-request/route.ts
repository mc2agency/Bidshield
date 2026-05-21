import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { auth } from "@clerk/nextjs/server";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rateLimit";
import { requireProSubscription } from "@/lib/requireProSubscription";
import { z } from "zod";

const MAX_RECIPIENTS = 10;

const PricingRequestSchema = z.object({
  vendorEmails: z.array(z.string().email()).min(1).max(MAX_RECIPIENTS),
  manufacturer: z.string().min(1).max(200).trim(),
  items: z.array(z.object({
    name: z.string().min(1).max(200).trim(),
    qty: z.number().min(0).max(1_000_000),
    unit: z.string().min(1).max(50).trim(),
  })).max(200),
  projectName: z.string().min(1).max(200).trim(),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await checkRateLimit(userId, "send_pricing_request", 20);
  if (!rl.allowed)
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429, headers: rateLimitHeaders(rl) });

  const proGuard = await requireProSubscription(userId);
  if (proGuard) return proGuard;

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "Email not configured" }, { status: 500 });
  }

  const parsed = PricingRequestSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { vendorEmails, manufacturer, items, projectName } = parsed.data;

  const resend = new Resend(process.env.RESEND_API_KEY);

  const lines = items
    .filter(i => i.qty > 0)
    .map(i => `  • ${i.name} — ${i.qty} ${i.unit}`)
    .join("\n");

  const subject = `Material Pricing Request – ${projectName}`;
  const text = `Hi,\n\nPlease provide pricing for the following ${manufacturer} materials on project: ${projectName}.\n\n${lines}\n\nPlease reply with your best pricing valid for 30 days.\n\nThank you`;

  const results = await Promise.allSettled(
    vendorEmails.map((email: string) =>
      resend.emails.send({
        from: "pricing@bidshield.co",
        to: email,
        subject,
        text,
      })
    )
  );

  const sent = results.filter(r => r.status === "fulfilled").length;
  const failed = results.filter(r => r.status === "rejected").length;

  return NextResponse.json({ sent, failed, total: vendorEmails.length });
}
