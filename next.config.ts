import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // F1 Hub Rewrites
      {
        source: "/api/f1/live",
        destination: "https://site.api.espn.com/apis/site/v2/sports/racing/f1/scoreboard",
      },
      {
        source: "/api/f1/standings",
        destination: "https://site.api.espn.com/apis/v2/sports/racing/f1/standings",
      },
      {
        source: "/api/f1/telemetry",
        destination: "https://api.openf1.org/v1/car_data",
      },
    ];
  },
  // Optimizing production bundles for smooth Aceternity UI renders
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
