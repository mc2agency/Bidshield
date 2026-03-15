"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function FooterWrapper() {
  const pathname = usePathname();
  // Suppress footer on all dashboard routes
  if (pathname.startsWith("/bidshield/dashboard")) return null;
  return <Footer />;
}
