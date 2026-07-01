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
          destination: `${process.env.NEXT_PUBLIC_GAME_APP_URL}/simulator`,
        },
        {
          source: '/simulator/:path*',
          destination: `${process.env.NEXT_PUBLIC_GAME_APP_URL}/simulator/:path*`,
        },
      ],
    }
  },
}

export default nextConfig
