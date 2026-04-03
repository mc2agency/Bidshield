/**
 * Purchase confirmation email template (L6).
 *
 * Extracted from app/api/webhooks/stripe/route.ts so email content is:
 * - reviewable as a diff when copy or styling changes
 * - testable in isolation without importing Next.js server modules
 * - reusable by any route that needs to send purchase emails
 *
 * TODO: Consider migrating to React Email (https://react.email) for
 * component-based authoring, typed props, and a local preview server:
 *   npm install react-email @react-email/components
 */

export interface PurchaseEmailParams {
  productName: string;
  downloadLinks: string; // pre-rendered <li> HTML for each file
  baseUrl: string;
  sessionId: string;
}

export function buildPurchaseEmailHtml(params: PurchaseEmailParams): string {
  const { productName, downloadLinks, baseUrl, sessionId } = params;
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
  .callout { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px 20px; margin: 20px 0; }
  .callout p { margin: 0; color: #166534; font-size: 14px; }
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
    <h2>Your download is ready</h2>
    <p>Thanks for purchasing <strong>${productName}</strong>. Click the link below to download your file:</p>
    <ul style="margin: 0 0 16px; padding-left: 20px;">
      ${downloadLinks}
    </ul>
    <div class="callout">
      <p><strong>Link not working?</strong> Go to <a href="${baseUrl}/checkout/success?session_id=${sessionId}" style="color: #059669;">your order page</a> to re-access your download at any time.</p>
    </div>
    <p style="color: #475569;">— Carlos, BidShield</p>
  </div>
  <div class="footer">
    <p>BidShield &middot; <a href="${baseUrl}" style="color: #94a3b8;">bidshield.co</a></p>
    <p style="margin-top: 6px;">You're receiving this because you purchased a template from BidShield.</p>
  </div>
</div>
</body>
</html>`;
}

/** Build the <li> download link HTML for a list of filenames. */
export function buildDownloadLinks(files: string[], baseUrl: string, sessionId: string): string {
  return files
    .map(
      (file) =>
        `<li style="margin-bottom:8px;"><a href="${baseUrl}/api/download?file=${encodeURIComponent(file)}&session=${sessionId}" style="color:#059669;font-weight:600;">${file}</a></li>`
    )
    .join("");
}
