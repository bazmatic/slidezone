/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use export output for Electron builds
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Disable server-side features that don't work in static export
  experimental: {
    esmExternals: false
  }
}

module.exports = nextConfig 