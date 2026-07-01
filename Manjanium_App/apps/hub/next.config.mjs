/** @type {import("next").NextConfig} */
const nextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  async rewrites() {
    const GAME_URL = process.env.GAME_URL || "http://localhost:3001";
    return [
      {
        source: '/game',
        destination: `${GAME_URL}/game`,
      },
      {
        source: '/game/:path*',
        destination: `${GAME_URL}/game/:path*`,
      },
    ];
  },
};

export default nextConfig;
