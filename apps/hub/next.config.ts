import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimizing production bundles
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  async rewrites() {
    return [
      {
        source: '/simulator/:path*',
        destination: `${process.env.GAME_APP_URL || 'http://localhost:3001'}/:path*`,
      },
    ];
  },
};

export default nextConfig;
