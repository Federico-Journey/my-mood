import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Foto di Google Places (lh3.googleusercontent.com)
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      // Fallback: Maps Static API
      {
        protocol: "https",
        hostname: "maps.googleapis.com",
      },
    ],
  },
};

export default nextConfig;
