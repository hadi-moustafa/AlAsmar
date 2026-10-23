import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Photos are links from the Google Sheet (any host); Drive links are already resized to 800px.
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      // Admin photos are resized in the browser before upload; this is just headroom.
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
