import type { NextConfig } from "next";

const BACKEND_URL = "https://s19challange-production.up.railway.app";

const nextConfig: NextConfig = {
    async rewrites() {
        return [{ source: "/api/:path*", destination: `${BACKEND_URL}/:path*` }];
    },
};

export default nextConfig;
