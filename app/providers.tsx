"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ReactNode, useState, useEffect } from "react";
import { LanguageProvider } from "@/lib/i18n";

// Singleton client - only created once on client side
let convexClient: ConvexReactClient | null = null;

function getConvexClient(): ConvexReactClient {
  if (!convexClient) {
    convexClient = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  }
  return convexClient;
}

export function Providers({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const [convex, setConvex] = useState<ConvexReactClient | null>(null);

  useEffect(() => {
    setIsClient(true);
    setConvex(getConvexClient());
  }, []);

  // During SSR or before hydration, render children without any providers
  // This prevents Clerk and Convex from failing due to missing env vars during build
  if (!isClient || !convex) {
    return <LanguageProvider>{children}</LanguageProvider>;
  }

  return (
    <LanguageProvider>
      <ClerkProvider>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          {children}
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </LanguageProvider>
  );
}
