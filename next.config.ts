import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // F1 Hub Rewrites (Legacy ESPN)
      {
        source: "/api/f1/live",
        destination: "https://site.api.espn.com/apis/site/v2/sports/racing/f1/scoreboard",
      },
      {
        source: "/api/f1/standings",
        destination: "https://site.api.espn.com/apis/v2/sports/racing/f1/standings",
      },
      // OpenF1 Live Telemetry Proxy Rewrites
      {
        source: "/api/openf1/position",
        destination: "https://api.openf1.org/v1/position",
      },
      {
        source: "/api/openf1/intervals",
        destination: "https://api.openf1.org/v1/intervals",
      },
      {
        source: "/api/openf1/car_data",
        destination: "https://api.openf1.org/v1/car_data",
      },
      {
        source: "/api/openf1/race_control",
        destination: "https://api.openf1.org/v1/race_control",
      },
    ];
  },
  // Optimizing production bundles for smooth Aceternity UI renders
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
