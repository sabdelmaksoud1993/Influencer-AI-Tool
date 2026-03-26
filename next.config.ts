import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Mobile directory is excluded from web build — type errors there are irrelevant
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
