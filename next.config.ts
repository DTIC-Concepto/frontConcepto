import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'https://backprueba-production-fdf6.up.railway.app',
  },
};

export default nextConfig;
