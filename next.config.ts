import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Core performance optimizations
  output: "standalone",
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Turbopack configuration for Next.js 16
  turbopack: {},
  
  // Image optimization (updated for Next.js 16)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'your-domain.com',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  
  // Performance headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/demo',
        destination: '/#demo',
        permanent: false,
      },
      {
        source: '/features',
        destination: '/#features',
        permanent: false,
      },
      {
        source: '/compliance',
        destination: '/#features',
        permanent: false,
      },
    ];
  },
  
  // Bundle analyzer for development (compatible with Turbopack)
  webpack: (config, { dev, isServer }) => {
    // Bundle analyzer (development only)
    if (process.env.ANALYZE === 'true' && dev && !isServer) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      );
    }
    
    return config;
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Asset optimization
  assetPrefix: process.env.NODE_ENV === 'production' ? process.env.CDN_URL : '',
};

export default nextConfig;
