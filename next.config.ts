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

      // Football Match Center Rewrites (Using your verified API-Sports account)
      {
        source: "/api/football/fixtures/live",
        destination: "https://v3.football.api-sports.io/fixtures?live=all",
        has: [
          {
            type: "header",
            key: "x-apisports-key",
            value: process.env.API_SPORTS_KEY,
          },
        ],
      },
      {
        source: "/api/football/standings",
        destination: "https://v3.football.api-sports.io/standings",
        has: [
          {
            type: "header",
            key: "x-apisports-key",
            value: process.env.API_SPORTS_KEY,
          },
        ],
      },
    ];
  },
  // Optimizing production bundles for smooth Aceternity UI renders
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
