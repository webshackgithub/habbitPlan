import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  serverExternalPackages: ["@prisma/adapter-better-sqlite3", "better-sqlite3"],
};

export default nextConfig;
