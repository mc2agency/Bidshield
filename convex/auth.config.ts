import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      domain: "https://clerk.mc2estimating.com",
      applicationID: "convex",
    },
  ]
} satisfies AuthConfig;
