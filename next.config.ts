import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'export',
    images: {
        unoptimized: true,
    },
    experimental: {
        // These ship as large barrel files; per-icon/per-primitive imports keep them out of the shared bundle.
        optimizePackageImports: ['lucide-react', 'date-fns', 'recharts'],
    },
};

export default nextConfig;
