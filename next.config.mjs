/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverComponentsExternalPackages: ['firebase', 'openai', 'langchain']
  },
  webpack: (config, { isServer }) => {
    // Handle Firebase and OpenAI in client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    
    // Handle ESM modules
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true
    }
    
    return config
  },
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com']
  }
}

export default nextConfig