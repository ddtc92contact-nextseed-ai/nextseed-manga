import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server in .next/standalone, used by the Docker image (see Dockerfile).
  output: "standalone",
  images: {
    // AVIF first (smallest), WebP fallback; the original format only if neither is accepted.
    formats: ["image/avif", "image/webp"],
    qualities: [75],
    // Content images have content-hashed file names (scripts/sync-content-images.mjs),
    // so optimised copies can be cached for a long time.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
