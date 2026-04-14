/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cf-rstatic.com',
      },
      {
        protocol: 'https',
        hostname: '*.minio.local',
      },
    ],
  },
  serverActions: {
    bodySizeLimit: '50mb',
  },
};

module.exports = nextConfig;
