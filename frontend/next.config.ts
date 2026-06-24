import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d25g9z9s77rn4i.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "tiimg.tistatic.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    unoptimized: true, // Disable image optimization for external images to avoid 403 errors
  },
};

export default nextConfig;
