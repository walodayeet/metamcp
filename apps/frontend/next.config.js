/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["better-auth", "@better-fetch/fetch"],
  experimental: {
    allowedDevOrigins: ["192.168.9.24", "localhost", "127.0.0.1"],
    proxyTimeout: 1000 * 120,
  },
  async rewrites() {
    const backendUrl = "http://localhost:12009";
    return [
      { source: "/health", destination: `${backendUrl}/health` },
      { source: "/oauth/:path*", destination: `${backendUrl}/oauth/:path*` },
      { source: "/.well-known/:path*", destination: `${backendUrl}/.well-known/:path*` },
      { source: "/api/auth/:path*", destination: `${backendUrl}/api/auth/:path*` },
      { source: "/register", destination: `${backendUrl}/api/auth/register` },
      { source: "/trpc/:path*", destination: `${backendUrl}/trpc/frontend/:path*` },
      { source: "/mcp-proxy/:path*", destination: `${backendUrl}/mcp-proxy/:path*` },
      { source: "/metamcp/:path*", destination: `${backendUrl}/metamcp/:path*` },
      { source: "/service/:path*", destination: "https://metatool-service.jczstudio.workers.dev/:path*" },
    ];
  },
};

export default nextConfig;