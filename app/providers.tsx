"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ReactNode, useMemo } from "react";

// Module-level singleton client - only created once on client side
let convexClient: ConvexReactClient | null = null;

function getConvexClient(): ConvexReactClient {
  if (typeof window === "undefined") {
    // Return a dummy during SSR - will be replaced on client
    return null as unknown as ConvexReactClient;
  }
  if (!convexClient) {
    convexClient = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  }
  return convexClient;
}

export function Providers({ children }: { children: ReactNode }) {
  // Use useMemo to ensure consistent client reference across renders
  const convex = useMemo(() => getConvexClient(), []);

  // Always render the same tree structure to prevent hydration mismatches
  // and avoid child re-mounts. ClerkProvider handles SSR gracefully.
  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
