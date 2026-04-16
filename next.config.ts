import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['mongodb', 'better-sqlite3', '@libsql/client'],
};

export default nextConfig;
