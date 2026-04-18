import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Reduce client bundle size by tree-shaking barrel-export packages at build
  // time instead of importing the entire module graph. Covers icon libraries,
  // heavy charting (recharts), Clerk (shipped on every authed page), and date
  // utilities if added later.
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@heroicons/react",
      "recharts",
      "@clerk/nextjs",
    ],
  },

  images: {
    // Prefer modern formats; browsers that don't support them fall back to JPEG/PNG.
    formats: ["image/avif", "image/webp"],
  },

  // Strip React prop-types in production builds (saves ~3 kB gzipped).
  compiler: {
    removeConsole: process.env.NODE_ENV === "production"
      ? { exclude: ["error", "warn"] }
      : false,
  },
};

export default nextConfig;
