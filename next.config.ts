import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  // T013/T014: these load native binaries at runtime via Node's native addon
  // loader, which Turbopack can't statically bundle — keep them external.
  serverExternalPackages: ["@resvg/resvg-js", "sharp"],
};

export default nextConfig;
