/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@react-pdf/renderer"],
    // Include public/images in the serverless function bundle so
    // @react-pdf/renderer can read logo + images via the filesystem on Vercel
    outputFileTracingIncludes: {
      "/api/submit": ["./public/images/**"],
    },
  },
};

export default nextConfig;
