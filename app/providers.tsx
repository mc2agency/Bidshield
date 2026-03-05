"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ReactNode } from "react";
import { LanguageProvider } from "@/lib/i18n";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
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
