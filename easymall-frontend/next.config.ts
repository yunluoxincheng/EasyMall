import type { NextConfig } from "next";

const backendOrigin =
  process.env.EASYMALL_BACKEND_ORIGIN || "http://127.0.0.1:8080";
const proxyEnabled = process.env.EASYMALL_ENABLE_DEV_PROXY !== "false";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async rewrites() {
    if (!proxyEnabled) {
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${backendOrigin}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
