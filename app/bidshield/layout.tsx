"use client";

import { useEffect } from "react";

export default function BidShieldLayout({ children }: { children: React.ReactNode }) {
  // Hide the main MC2 Navigation and Footer when inside BidShield
  useEffect(() => {
    const nav = document.querySelector("body > div > nav");
    const footer = document.querySelector("body > div > footer");
    if (nav) (nav as HTMLElement).style.display = "none";
    if (footer) (footer as HTMLElement).style.display = "none";
    return () => {
      if (nav) (nav as HTMLElement).style.display = "";
      if (footer) (footer as HTMLElement).style.display = "";
    };
  }, []);

  return <>{children}</>;
}
