import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    allowedDevOrigins: ['https://wb.msuliman.tech', 'http://wb.msuliman.tech'],
  },
};

export default nextConfig;