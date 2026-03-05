"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ReactNode } from "react";
import { LanguageProvider } from "@/lib/i18n";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL ?? "https://placeholder.convex.cloud";
const convex = new ConvexReactClient(convexUrl);

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

export function Providers({ children }: { children: ReactNode }) {
  // During build/prerender without env vars, render without auth providers
  if (!clerkKey) {
    return <LanguageProvider>{children}</LanguageProvider>;
  }

  return (
    <ClerkProvider
      publishableKey={clerkKey}
      afterSignInUrl="/bidshield/dashboard"
      afterSignUpUrl="/bidshield/dashboard"
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
