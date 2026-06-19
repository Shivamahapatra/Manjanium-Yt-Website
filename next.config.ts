import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/f1/live',
        destination: 'https://site.api.espn.com/apis/site/v2/sports/racing/f1/scoreboard',
      },
      {
        source: '/api/football/live',
        destination: 'https://site.api.espn.com/apis/site/v2/sports/soccer/all/scoreboard',
      },
    ];
  },
};

export default nextConfig;
