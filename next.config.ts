import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimizing production bundles
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
