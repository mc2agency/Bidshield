import { AuthConfig } from "convex/server";

// L3: Verify this domain matches the Clerk Dashboard → Domains setting for BidShield.
// To confirm: log in to dashboard.clerk.com → your BidShield app → Domains.
// If the domain shown there differs from "clerk.bidshield.co", update the value below
// and run `npx convex dev` locally to verify end-to-end login still works.
export default {
  providers: [
    {
      domain: "https://clerk.bidshield.co",
      applicationID: "convex",
    },
  ]
} satisfies AuthConfig;
