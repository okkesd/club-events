import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

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
