import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Bypass ESLint during build
  },
  typescript: {
    ignoreBuildErrors: true, // Bypass TypeScript errors during build
  },
};

export default nextConfig;
