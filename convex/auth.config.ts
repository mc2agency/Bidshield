import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      domain: "https://clerk.bidshield.co",
      applicationID: "convex",
    },
  ]
} satisfies AuthConfig;
