/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'standalone',
  // 允许跨域开发访问
  allowedDevOrigins: [
    'localhost:3000',
    '127.0.0.1:3000',
    'www.promto.org',
    'promto.org',
    '127.0.0.1',
  ],
}

export default nextConfig
