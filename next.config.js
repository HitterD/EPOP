/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: false,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false,
  analyzerMode: 'static',
  reportFilename: process.env.ANALYZE_REPORT || 'analyze/client.html',
  generateStatsFile: true,
  statsFilename: process.env.ANALYZE_STATS || 'analyze/stats.json',
})

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    dirs: ['app', 'components', 'features', 'lib', 'types'],
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['localhost'],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    // Enable optimized font loading
    optimizePackageImports: ['lucide-react', 'recharts', '@radix-ui/react-icons'],
  },
  // Performance budgets (enforced via bundle analyzer)
  // Target: Route JS ≤300KB gzip, Vendor ≤150KB gzip
  productionBrowserSourceMaps: false,
  
  webpack: (config, { webpack }) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    })
    
    // Performance hints
    config.performance = {
      maxEntrypointSize: 300_000, // 300KB per route
      maxAssetSize: 150_000, // 150KB per chunk
      hints: process.env.NODE_ENV === 'production' ? 'warning' : false,
    }
    
    return config
  },
}

module.exports = withBundleAnalyzer(withPWA(nextConfig))
