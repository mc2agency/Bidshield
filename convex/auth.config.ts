import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      domain: "https://helpful-jackal-16.clerk.accounts.dev",
      applicationID: "convex",
    },
  ]
} satisfies AuthConfig;
