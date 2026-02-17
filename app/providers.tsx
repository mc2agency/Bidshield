"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexProvider } from "convex/react";
import { ReactNode, useState, useEffect } from "react";
import { LanguageProvider } from "@/lib/i18n";

let convexClient: ConvexReactClient | null = null;

function getConvexClient(): ConvexReactClient | null {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) return null;
  if (!convexClient) {
    convexClient = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);
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

  if (!isClient || !convex) {
    return <LanguageProvider>{children}</LanguageProvider>;
  }

  // Clerk disabled during rebuild — using Convex directly
  return (
    <LanguageProvider>
      <ConvexProvider client={convex}>
        {children}
      </ConvexProvider>
    </LanguageProvider>
  );
}
