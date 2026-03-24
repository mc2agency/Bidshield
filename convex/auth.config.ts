import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      // TODO: Confirm exact Clerk FAPI domain for bidshield.co in Clerk Dashboard → Domains
      domain: "https://clerk.bidshield.co",
      applicationID: "convex",
    },
  ]
} satisfies AuthConfig;
