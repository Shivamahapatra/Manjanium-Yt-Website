/** @type {import("next").NextConfig} */
const nextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  async rewrites() {
    return {
      afterFiles: [
        {
          source: '/simulator',
          destination: `${process.env.NEXT_PUBLIC_GAME_APP_URL || 'http://localhost:3001'}/simulator`,
        },
        {
          source: '/simulator/:path*',
          destination: `${process.env.NEXT_PUBLIC_GAME_APP_URL || 'http://localhost:3001'}/simulator/:path*`,
        },
      ],
    }
  },
}

export default nextConfig
