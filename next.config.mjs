/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  allowedDevOrigins: ["10.27.3.50", "localhost:3000"],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
      {
        protocol: "https",
        hostname: "bio-basket.com",
      },
      {
        protocol: "https",
        hostname: "theorganicworld.com",
      },
      {
        protocol: "https",
        hostname: "go4fresh.com",
      },
    ],
  },
};

export default nextConfig; // Force Restart: 1775905634546