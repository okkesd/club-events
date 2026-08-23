import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  output: "standalone",

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'iaidhetakrjyqsoyrges.supabase.co',
      },
      // Approved scraped events default their cover image to the source
      // Instagram post, so the post CDN has to be allowed through next/image.
      {
        protocol: 'https',
        hostname: '**.cdninstagram.com',
      },
      {
        protocol: 'https',
        hostname: '**.fbcdn.net',
      },
      // Placeholder host used by the seeded [TEST] scraped rows.
      // Remove once those rows are deleted — nothing else uses it.
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
  
  async redirects() {
    return [
      {
        source: '/',
        destination: '/main',
        permanent: true, // Set to true for a permanent redirect
      },
    ]
  },
};

export default nextConfig;
