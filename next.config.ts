import type {NextConfig} from "next";

<<<<<<< HEAD
const BACKEND = "http://130.61.88.121:9000/workintech";

const nextConfig: NextConfig = {
    async rewrites() {
        return [
            {source: "/api/:path*", destination: `${BACKEND}/:path*`},
        ];
=======
const BACKEND_URL = "https://s19challange-production.up.railway.app";

const nextConfig: NextConfig = {
    async rewrites() {
        return [{ source: "/api/:path*", destination: `${BACKEND_URL}/:path*` }];
>>>>>>> parent of 361d8fb (.)
    },
};

export default nextConfig;
