/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: process.cwd(),
  experimental: {
    optimizeCss: false,
    webpackBuildWorker: false,
  },
};

export default nextConfig;
