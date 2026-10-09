import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Photos are links from the Google Sheet (any host); Drive links are already resized to 800px.
    unoptimized: true,
  },
};

export default nextConfig;
