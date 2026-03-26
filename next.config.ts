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
      {
        key: 'Content-Security-Policy',
        value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://vercel.live https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' blob: data: https://images.unsplash.com https://api.dicebear.com https://pub-01b9a208b3354278b07d052222dd1f6a.r2.dev; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.r2.dev https://api.stripe.com; frame-src 'self' https://js.stripe.com https://hooks.stripe.com; object-src 'none';"
      },
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
