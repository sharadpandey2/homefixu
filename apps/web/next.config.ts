import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  experimental: {
    turbopack: {
      root: "../../",
    },
  },
  async rewrites() {
    return [
      {
        // This will proxy all /api requests to your NestJS backend
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000"}/api/:path*`,
      },
    ];
  },
};

if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}
export default nextConfig;
