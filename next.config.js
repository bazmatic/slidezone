/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only use export output for production builds
  ...(process.env.NODE_ENV === 'production' && {
    output: 'export',
    trailingSlash: true,
  }),
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig 