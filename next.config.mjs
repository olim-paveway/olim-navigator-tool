/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@react-pdf/renderer"],
    // Include only the file the PDF generator reads from the filesystem
    // (@react-pdf/renderer on Vercel); a broad glob would drag every public
    // image into the /api/submit function bundle
    outputFileTracingIncludes: {
      "/api/submit": ["./public/images/paveway-logo-transparent.png"],
    },
  },
};

export default nextConfig;
