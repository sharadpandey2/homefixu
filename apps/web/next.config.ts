import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  async rewrites() {
    return [
      {
        // This will proxy all /api requests to your NestJS backend
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_SERVER_URL || "https://server-production-c3c4.up.railway.app"}/api/:path*`,
      },
    ];
  },
};

if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}
export default nextConfig;
