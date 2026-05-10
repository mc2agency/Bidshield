import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  if (!process.env.RESEND_API_KEY) {
    return Response.json({ error: "Email not configured" }, { status: 500 });
  }

  const { vendorEmails, manufacturer, items, projectName } = await req.json() as {
    vendorEmails: string[];
    manufacturer: string;
    items: { name: string; qty: number; unit: string }[];
    projectName: string;
  };

  if (!vendorEmails?.length) {
    return Response.json({ error: "No vendor emails provided" }, { status: 400 });
  }

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

  return Response.json({ sent, failed, total: vendorEmails.length });
}
