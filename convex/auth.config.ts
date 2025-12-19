import { AuthConfig } from "convex/server";

// Use production Clerk domain if available, otherwise fall back to dev domain
const clerkDomain = process.env.CLERK_JWT_ISSUER_DOMAIN || "https://helpful-jackal-16.clerk.accounts.dev";

export default {
  providers: [
    {
      // Clerk JWT Issuer Domain
      // Set CLERK_JWT_ISSUER_DOMAIN in production environment variables
      // For production with custom domain: https://clerk.mc2estimating.com
      // For Clerk cloud: https://helpful-jackal-16.clerk.accounts.dev
      domain: clerkDomain,
      applicationID: "convex",
    },
  ]
} satisfies AuthConfig;
