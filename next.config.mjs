/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    // 允许你的域名访问开发服务器
    allowedDevOrigins: ["www.promto.org"],
  },
  images: {
    unoptimized: true,
  },
 
}

export default nextConfig
