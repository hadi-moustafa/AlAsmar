import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  experimental: {
    serverActions: {
      // Images are resized in the browser before upload, this is just headroom.
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
