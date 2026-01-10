/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'm6veliqck7ah4o0y.public.blob.vercel-storage.com',
      },
    ],
  },
};

module.exports = nextConfig;
