import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      // Clerk JWT Issuer Domain
      // This matches your Clerk "convex" JWT template
      domain: "https://helpful-jackal-16.clerk.accounts.dev",
      applicationID: "convex",
    },
  ]
} satisfies AuthConfig;
