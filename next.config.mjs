/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: process.cwd(),
  experimental: {
    optimizeCss: false,
  },
};

export default nextConfig;
