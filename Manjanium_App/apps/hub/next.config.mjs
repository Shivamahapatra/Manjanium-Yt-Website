/** @type {import("next").NextConfig} */
const nextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  async rewrites() {
    let gameUrl = process.env.NEXT_PUBLIC_GAME_APP_URL || 'http://localhost:3001';
    if (!gameUrl.startsWith('http')) {
      gameUrl = `https://${gameUrl}`;
    }
    gameUrl = gameUrl.replace(/\/$/, ''); // Remove trailing slash if present

    return {
      afterFiles: [
        {
          source: '/simulator',
          destination: `${gameUrl}/simulator`,
        },
        {
          source: '/simulator/:path*',
          destination: `${gameUrl}/simulator/:path*`,
        },
      ],
    }
  },
}

export default nextConfig
