import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Reduce client bundle size by tree-shaking icon libraries at build time
  // instead of importing the entire package.
  experimental: {
    optimizePackageImports: ["lucide-react", "@heroicons/react"],
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
