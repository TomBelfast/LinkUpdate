/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: false,

  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'http', hostname: 'pollywood.zapto.org' }
    ],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },

  // Wyłączamy Source Maps dla oszczędności pamięci podczas budowania
  productionBrowserSourceMaps: false,

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        crypto: false, // Zmienione na false jeśli nie używamy bibliotek wymagających natywnego crypto w kliencie
        stream: false,
        buffer: false
      };
    }
    return config;
  }
};

export default nextConfig;
