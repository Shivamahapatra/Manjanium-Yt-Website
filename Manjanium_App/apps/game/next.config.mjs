/** @type {import("next").NextConfig} */
const nextConfig = {
  basePath: '/simulator',
  assetPrefix: '/simulator',
  // Allow hub to rewrite to this app
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ]
  },
}

export default nextConfig
