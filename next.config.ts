import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === "production" ? "/explodiemoji" : "",
  assetPrefix: process.env.NODE_ENV === "production" ? "/explodiemoji/" : "",
};

export default nextConfig;
