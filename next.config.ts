import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
  transpilePackages: ["dbui", "dbui-shells"],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "dbui-shells": path.resolve(__dirname, "dbui-shells/src"),
      dbui: path.resolve(__dirname, "dbui/src"),
    };
    return config;
  },
};

export default nextConfig;
