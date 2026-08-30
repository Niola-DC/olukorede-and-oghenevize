import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AVIF first (≈20% smaller than WebP), WebP fallback, then the source
    // format for browsers that support neither. Next caches each variant.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
