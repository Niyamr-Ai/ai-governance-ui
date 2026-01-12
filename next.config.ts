import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["knex"],
  // Turbopack configuration (Next.js 16 default)
  turbopack: {
    root: process.cwd(), // Explicitly set root to silence warning
    resolveAlias: {
      // Ensure pdfjs-dist resolves correctly
      "pdfjs-dist": "pdfjs-dist",
    },
    resolveExtensions: [".mjs", ".js", ".ts", ".tsx", ".json"],
  },
  // Proxy API calls to Express backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },

  // Ensure rewrites take precedence over built-in API handling
  experimental: {
    serverComponentsExternalPackages: ['knex'],
  },
  // Webpack configuration (for --webpack flag)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude Node.js modules from client bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;
