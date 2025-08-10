/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    optimizePackageImports: [
      '@headlessui/react',
      '@heroicons/react',
      'react-icons'
    ],
    workerThreads: true,
    cpus: 4,
    optimizeCss: true,
    scrollRestoration: true
  },
  images: {
    domains: ['localhost', 'pollywood.zapto.org', 'i.ytimg.com'],
    unoptimized: false,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'pollywood.zapto.org',
        port: '3306',
        pathname: '/api/media/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        pathname: '/vi/**',
      },
    ],
  },
  staticPageGenerationTimeout: 180,
  compiler: {
    styledComponents: true,
    removeConsole: process.env.NODE_ENV === 'production',
    reactRemoveProperties: process.env.NODE_ENV === 'production',
    relay: {
      src: './',
      artifactDirectory: './__generated__',
    },
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  webpack: (config, { isServer, dev }) => {
    // Konfiguracja Node.js polyfills
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        aws_sdk: false,
        nock: false,
        mock_aws_s3: false,
        bcrypt: false,
        crypto: 'crypto-browserify',
        stream: 'stream-browserify',
        buffer: 'buffer'
      };
    }

    // Dodanie reguły do ignorowania plików HTML z @mapbox/node-pre-gyp
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /\.html$/,
      include: /node_modules[\\/]@mapbox[\\/]node-pre-gyp/,
      use: 'null-loader'
    });

    // Optymalizacja dla produkcji
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        minimize: true,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          minChunks: 1,
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
          cacheGroups: {
            defaultVendors: {
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              reuseExistingChunk: true,
            },
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    return config;
  },
  env: {
    HOST: '0.0.0.0'
  },
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 4,
  },
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  modularizeImports: {
    '@headlessui/react': {
      transform: '@headlessui/react/{{member}}',
    },
    '@heroicons/react': {
      transform: '@heroicons/react/{{member}}',
    },
    'react-icons/(?<name>[^/]+)': {
      transform: 'react-icons/{{name}}/{{member}}',
    },
  },
  output: 'standalone',
  productionBrowserSourceMaps: false,
  generateEtags: true,
  httpAgentOptions: {
    keepAlive: true,
  },
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on'
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN'
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block'
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin'
        }
      ]
    }
  ]
};

export default nextConfig;
