import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
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
    ],
  },
};

export default nextConfig;
