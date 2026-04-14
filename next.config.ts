import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["100.70.40.170"],
  webpack: (config) => {
    config.resolve.symlinks = true;
    return config;
  },
};

export default nextConfig;
