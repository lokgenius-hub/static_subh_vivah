import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/static_subh_vivah",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // trailingSlash ensures each page gets its own folder with index.html
  trailingSlash: true,
};

export default nextConfig;
