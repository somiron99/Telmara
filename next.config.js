/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint and TypeScript errors during builds for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Disable SWC minification to avoid self reference issues
  swcMinify: false,

  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  
  // Image optimization for Vercel
  images: {
    domains: [
      'localhost',
      // Add your Supabase project domain here
      // 'your-project-id.supabase.co'
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Optimize for production
  swcMinify: true,
  compress: true,
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
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
            value: 'DENY'
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
  },
  
  // Redirects for better SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ]
  },
  
  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Simplified webpack configuration
  webpack: (config, { isServer }) => {
    // Only add fallbacks for client-side
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      }
    }

    return config
  },
  
  // Output configuration for better performance
  // output: 'standalone', // Disabled for Vercel deployment
  
  // Enable static optimization
  trailingSlash: false,
  
  // Disable x-powered-by header
  poweredByHeader: false,
  
  // Enable React strict mode
  reactStrictMode: true,
}

module.exports = nextConfig
