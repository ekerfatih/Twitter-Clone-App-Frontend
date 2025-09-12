import type {NextConfig} from "next";

const BACKEND = "http://130.61.88.121:9000/workintech";

const nextConfig: NextConfig = {
    async rewrites() {
        return [
            {source: "/api/:path*", destination: `${BACKEND}/:path*`},
        ];
    },
};

export default nextConfig;
