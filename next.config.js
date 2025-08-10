/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    allowedDevOrigins: ['172.24.108.30:9999', 'localhost:9999', '0.0.0.0:9999', 'link3.aihub.ovh']
  },
  // Wyłącz strict mode dla lepszej kompatybilności
  reactStrictMode: false,
  // Konfiguracja dla lepszej obsługi błędów
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  images: {
    domains: ['i.ytimg.com', 'img.youtube.com', 'localhost', 'pollywood.zapto.org'],
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        pathname: '/vi/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/vi/**',
      },
    ],
  },
  // Docker standalone output
  output: 'standalone',
}

export default nextConfig