import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      {
        protocol: 'https',
        hostname: 'pub-01b9a208b3354278b07d052222dd1f6a.r2.dev',
      },
    ],
  },
  async headers() {
    const securityHeaders = [
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=(), interest-cohort=()' },
      { key: 'X-XSS-Protection', value: '0' },
    ];

    const assetCaching = [
      {
        key: 'Cache-Control',
        value: 'public, max-age=0, s-maxage=31536000, stale-while-revalidate=86400',
      },
    ];

    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        source: '/:all*(js|css|svg|png|jpg|jpeg|gif|webp|ico|ttf|woff|woff2)',
        headers: [...securityHeaders, ...assetCaching],
      },
    ];
  },
};

export default nextConfig;
